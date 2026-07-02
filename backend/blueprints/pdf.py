from flask import Blueprint, request
import base64
import fitz
from utils.helpers import error, send_file_and_cleanup, success
from utils.validators import validate_uploaded_file, validate_pdf_file

pdf_bp = Blueprint("pdf", __name__)

@pdf_bp.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    doc = None
    pdf_bytes = None
    pix = None
    png_bytes = None

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

        # Extract DPI/resolution settings. Default to 72 DPI (standard screen resolution).
        # DPI determines the scaling: zoom = requested_dpi / 72
        # For 150 DPI: zoom = 150/72 = 2.08
        # For 300 DPI: zoom = 300/72 = 4.17
        dpi = request.form.get("dpi", "72")
        try:
            dpi = int(dpi)
            if dpi < 72 or dpi > 600:
                return error("DPI must be between 72 and 600")
        except (ValueError, TypeError):
            return error("Invalid DPI value. Must be an integer.")

        # Calculate zoom level from DPI
        zoom = dpi / 72.0

        doc = fitz.open(
            stream=pdf_bytes,
            filetype="pdf",
        )

        try:
            if doc.page_count == 0:
                return error("Empty PDF")

            page = doc.load_page(0)

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
            # Clean up pixmap
            if pix:
                try:
                    pix = None
                except Exception:
                    pass

        if request.form.get("response_type") == "base64":
            base64_string = base64.b64encode(png_bytes).decode("utf-8")
            # Force garbage collection
            import gc
            gc.collect()
            return success(
		{
		    "image_data": (
                	f"data:image/png;base64,{base64_string}"
            	    )
        	},
        	"Image encoded successfully.",
    	    )

        response = send_file_and_cleanup(
            png_bytes,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )
        
        # Force garbage collection
        import gc
        gc.collect()
        
        return response

    except Exception:
        # Handle corrupted PDFs gracefully
        return error(
            "The provided PDF file appears to be corrupted or unreadable."
        )
