from flask import Blueprint, request, send_file, jsonify
import fitz  # PyMuPDF
import io
from utils.validators import validate_uploaded_file, validate_pdf_file

merge_pdf_bp = Blueprint("merge_pdf", __name__)


@merge_pdf_bp.route("/merge-pdf", methods=["POST"])
def merge_pdfs():
    files = request.files.getlist("files")

    if not files or len(files) < 2:
        return jsonify({"error": "Please upload at least 2 PDF files."}), 400

    merged = fitz.open()

    try:
        for f in files:
            _, filename, upload_error = validate_uploaded_file(f, f.filename)
            if upload_error:
                return upload_error
            pdf_error = validate_pdf_file(filename)
            if pdf_error:
                return pdf_error

            if pdf_error:
                return pdf_error
            data = f.read()
            try:
                src = fitz.open(stream=data, filetype="pdf")
            except fitz.FileDataError:
                return jsonify({"error": f"'{f.filename}' appears to be corrupted or is not a valid PDF."}), 400
            merged.insert_pdf(src)
            src.close()

        output = io.BytesIO()
        merged.save(output)
        output.seek(0)

        return send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="merged.pdf",
        )
    finally:
        merged.close()