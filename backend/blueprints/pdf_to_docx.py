import fitz  
import traceback
from io import BytesIO
from docx import Document

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup

pdf_docx_bp = Blueprint("pdf_docx", __name__)


@pdf_docx_bp.route("/convertDocx", methods=["POST"])
def convert_pdf_to_docx():
    doc = None
    try:
        if "file" not in request.files:
            return error("No file provided")

        pdf_file = request.files["file"]

        if pdf_file.filename == "":
            return error("No file selected")

        pdf_bytes = pdf_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if doc.page_count == 0:
            return error("Empty PDF")

        word_doc = Document()

        for i, page in enumerate(doc):
            text = page.get_text("text")

            if not text.strip():
                return error("PDF appears scanned or contains no extractable text")

            word_doc.add_paragraph(text)

            if i < doc.page_count - 1:
                word_doc.add_page_break()

        output = BytesIO()
        word_doc.save(output)
        output.seek(0)

        docx_bytes = output.getvalue()

        doc.close()

        return send_file_and_cleanup(
            docx_bytes,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name="converted.docx",
        )

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)