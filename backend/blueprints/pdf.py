import fitz  # PyMuPDF
import traceback
import io

from flask import Blueprint, request

from utils.file_handling import temp_upload_file
from utils.helpers import error, send_file_and_cleanup, safe_gc_collect

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    try:
        if "file" not in request.files:
            return error("No file provided")

        pdf_file = request.files["file"]

        if pdf_file.filename == "":
            return error("No file selected")

        with temp_upload_file(pdf_file) as temp_path:
            with fitz.open(temp_path) as doc:
                if doc.page_count == 0:
                    return error("Empty PDF")

                page = doc.load_page(0)
                zoom = 1.0
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat, alpha=False)

                # Get PNG bytes from pixmap
                png_bytes = pix.tobytes("png")

        return send_file_and_cleanup(
            png_bytes,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)
