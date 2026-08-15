import fitz  
import traceback
from io import BytesIO
from docx import Document

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup
from utils.validators import validate_pdf_file, validate_uploaded_file

pdf_docx_bp = Blueprint("pdf_docx", __name__)


@pdf_docx_bp.route("/convertDocx", methods=["POST"])
def convert_pdf_to_docx():
    doc = None
    try:
        pdf_file, filename, upload_error = validate_uploaded_file(request, "file")
        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(pdf_file, filename)
        if pdf_error:
            return pdf_error

        pdf_bytes = pdf_file.read()
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        except Exception:
            return error("Invalid PDF file provided", 400)

        if doc.page_count == 0:
            return error("Empty PDF")

        word_doc = Document()

        for i, page in enumerate(doc):
            text = page.get_text("text")

            if not text.strip():
                continue

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

    except Exception:
        traceback.print_exc()
        return error(
            "Failed to convert the PDF to DOCX. The file may be corrupted "
            "or unsupported.",
            500,
        )
