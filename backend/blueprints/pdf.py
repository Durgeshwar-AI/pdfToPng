import fitz  # PyMuPDF
import io
import os

from flask import Blueprint, request, send_file

from utils.helpers import error, safe_gc_collect

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    doc = None
    try:
        if "file" not in request.files:
            return error("No file provided")

        pdf_file = request.files["file"]

        if pdf_file.filename == "":
            return error("No file selected")

        pdf_bytes = pdf_file.stream.read()

        if not pdf_bytes:
            return error("Empty PDF")

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if doc.page_count == 0:
            return error("Empty PDF")

        page = doc.load_page(0)
        zoom = 1.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat, alpha=False)

        img_io = io.BytesIO(pix.tobytes("png"))
        img_io.seek(0)

        return send_file(
            img_io,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error(str(e), 500)
    finally:
        # Always close the PyMuPDF document to release native resources
        if doc is not None:
            try:
                doc.close()
            except Exception:
                pass
        safe_gc_collect()
