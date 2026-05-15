import fitz  # PyMuPDF
import os
import tempfile
import traceback

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    temp_pdf_path = None
    temp_png_path = None
    doc = None
    try:
        if "file" not in request.files:
            return error("No file provided")

        pdf_file = request.files["file"]

        if pdf_file.filename == "":
            return error("No file selected")

        # Use a temporary file to avoid loading the entire PDF into memory
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf_path = temp_pdf.name
        
        # Save the uploaded file to the temporary path (now that the file is closed)
        pdf_file.save(temp_pdf_path)

        doc = fitz.open(temp_pdf_path)

        try:
            if doc.page_count == 0:
                return error("Empty PDF")

            page = doc.load_page(0)
            zoom = 1.0
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)

            # Get a temporary file path
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_png:
                temp_png_path = temp_png.name
            
            # Save the pixmap to the temporary path (now that the file is closed)
            pix.save(temp_png_path)

        finally:
            if doc:
                doc.close()
            if temp_pdf_path and os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)

        return send_file_and_cleanup(
            temp_png_path,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )

    except Exception as e:
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
        if temp_png_path and os.path.exists(temp_png_path):
            os.remove(temp_png_path)
        
        traceback.print_exc()
        return error(str(e), 500)
