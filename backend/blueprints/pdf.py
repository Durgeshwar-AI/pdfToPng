import fitz  # PyMuPDF
import base64  

from flask import Blueprint, request
from utils.decorators import validate_mime
from utils.helpers import error, send_file_and_cleanup
from utils.validators import (
    validate_pdf_file,
    validate_uploaded_file,
)

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/convertPng", methods=["POST"])
@validate_mime('pdf')  # ✅ Decorator yahan lagega
def convert_pdf_to_png():
    doc = None

    try:
        pdf_file, filename, upload_error = validate_uploaded_file(
            request,
            "file",
        )

        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(pdf_file, filename)

        if pdf_error:
            return pdf_error

        # Read PDF into memory and open from bytes
        pdf_bytes = pdf_file.read()

        target_lang = request.form.get("language", "eng")

        doc = fitz.open(
            stream=pdf_bytes,
            filetype="pdf",
        )

        try:
            if doc.page_count == 0:
                return error("Empty PDF")

            page = doc.load_page(0)

            zoom = 1.0

            mat = fitz.Matrix(zoom, zoom)

            pix = page.get_pixmap(
                matrix=mat,
                alpha=False,
            )

            # Get PNG bytes from pixmap
            png_bytes = (
                pix.tobytes(output="png")
                if hasattr(pix, "tobytes")
                else pix.tobytes()
            )

        finally:
            if doc:
                doc.close()
            
        if request.form.get("response_type") == "base64":
            base64_string = base64.b64encode(png_bytes).decode("utf-8")
            return {
                "success": True,
                "message": "Image encoded successfully.",
                "image_data": f"data:image/png;base64,{base64_string}"
            }

        return send_file_and_cleanup(
            png_bytes,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )

    except Exception:
        # Handle corrupted PDFs gracefully
        return error(
            "The provided PDF file appears to be corrupted or unreadable."
        )