"""
PDF Signing Blueprint
Provides endpoint to add text-based signatures to PDF documents.
"""

import fitz
import io
import logging
from flask import Blueprint, request
from utils.helpers import error, send_file_and_cleanup
from utils.validators import validate_uploaded_file, validate_pdf_file

# Set up logging
logger = logging.getLogger(__name__)

sign_bp = Blueprint("sign", __name__)


@sign_bp.route("/sign/signPdf", methods=["POST"])
def sign_pdf():
    """
    Sign a PDF by adding signature text to the document.

    Expected form data:
    - file: PDF file to sign
    - signature: Signature text to add
    - position: (Optional) Position of signature (bottom-right, bottom-left, top-right, top-left, center)
    - font_size: (Optional) Size of the signature text (default: 14, range: 4-72)
    - color: (Optional) Hex color code for the signature text (default: 000099 - dark blue)

    Returns:
    - PDF file with signature stamped on the last page.
    """
    doc = None
    try:
        logger.info("PDF signing request received")

        # Validate uploaded file
        pdf_file, filename, upload_error = validate_uploaded_file(request, "file")
        if upload_error:
            return upload_error

        # Validate PDF extension
        pdf_error = validate_pdf_file(pdf_file, filename)
        if pdf_error:
            return pdf_error

        # Get signature text
        signature_text = request.form.get("signature", "").strip()
        if not signature_text:
            return error("Signature text is required", 400)

        MAX_SIGNATURE_LENGTH = 500
        if len(signature_text) > MAX_SIGNATURE_LENGTH:
            return error(f"Signature text must be {MAX_SIGNATURE_LENGTH} characters or fewer", 400)

        # Get and validate position
        position = request.form.get("position", "bottom-right")
        
        # Process PDF (need to check dimensions before validating positions)
        pdf_bytes = pdf_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if len(doc) == 0:
            return error("The PDF document has no pages", 400)

        # Stamp signature text on the last page
        page = doc[-1]
        
        # Define possible positions based on page rectangle
        positions = {
            "bottom-right": (page.rect.width - 220, page.rect.height - 60, page.rect.width - 20, page.rect.height - 20),
            "bottom-left": (20, page.rect.height - 60, 220, page.rect.height - 20),
            "top-right": (page.rect.width - 220, 20, page.rect.width - 20, 60),
            "top-left": (20, 20, 220, 60),
            "center": ((page.rect.width - 200) / 2, (page.rect.height - 40) / 2, (page.rect.width + 200) / 2, (page.rect.height + 40) / 2),
        }

        if position not in positions:
            logger.warning(f"Invalid position requested: {position}")
            return error(f"Invalid position '{position}'. Must be one of: {', '.join(positions.keys())}", 400)

        # Get and validate font size
        try:
            font_size = int(request.form.get("font_size", 14))
            # Reasonable bounds: prevent extremely small or large text
            if font_size < 4:
                font_size = 4
            elif font_size > 72:
                font_size = 72
        except (ValueError, TypeError):
            font_size = 14

        # Get and validate color
        color_hex = request.form.get("color", "000099").lstrip("#")
        try:
            # Convert hex to RGB values between 0 and 1
            color_rgb = tuple(int(color_hex[i:i+2], 16) / 255 for i in (0, 2, 4))
        except (ValueError, IndexError):
            color_rgb = (0, 0, 0.6)  # Default dark blue

        coord = positions[position]
        rect = fitz.Rect(*coord)
        
        # Insert text with specified properties
        page.insert_textbox(
            rect, 
            signature_text, 
            fontsize=font_size, 
            color=color_rgb,
            align=fitz.TEXT_ALIGN_CENTER if position == "center" else fitz.TEXT_ALIGN_LEFT
        )

        # Save to memory
        out = io.BytesIO()
        doc.save(out)
        out.seek(0)

        logger.info(f"PDF signed successfully with position={position}, font_size={font_size}")

        return send_file_and_cleanup(
            out.getvalue(),
            mimetype="application/pdf",
            as_attachment=True,
            download_name="signed.pdf",
        )

    except Exception as e:
        logger.error(f"PDF signing failed: {str(e)}", exc_info=True)
        return error(f"Failed to sign PDF: {str(e)}", 500)
    finally:
        if doc:
            doc.close()
