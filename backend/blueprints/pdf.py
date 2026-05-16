import fitz  # PyMuPDF
import traceback
from io import BytesIO

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup

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

        # Read PDF into memory and open from bytes
        pdf_bytes = pdf_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        try:
            if doc.page_count == 0:
                return error("Empty PDF")

            page = doc.load_page(0)
            zoom = 1.0
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)

            # Get PNG bytes from pixmap
            png_bytes = pix.tobytes(output="png") if hasattr(pix, "tobytes") else pix.tobytes()

        finally:
            if doc:
                doc.close()

        return send_file_and_cleanup(
            png_bytes,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)


@pdf_bp.route("/convertPngAsync", methods=["POST"])
def convert_pdf_to_png_async():
    if "file" not in request.files:
        return error("No file provided")
    
    file = request.files["file"]
    import base64
    from blueprints.tasks import long_pdf_to_png
    
    # Convert file to b64 for task transport
    file_content_b64 = base64.b64encode(file.read()).decode('utf-8')
    
    task = long_pdf_to_png.delay(file_content_b64, file.filename)
    return {"task_id": task.id}, 202


@pdf_bp.route("/status/<task_id>", methods=["GET"])
def get_status(task_id):
    from utils.celery_utils import celery
    task = celery.AsyncResult(task_id)
    
    response = {
        'state': task.state,
        'status': str(task.info)
    }
    
    if task.state == 'SUCCESS':
        response['result'] = task.result
        
    return response
