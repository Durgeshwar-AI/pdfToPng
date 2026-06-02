from flask import Blueprint, request, send_file, jsonify
import fitz  # PyMuPDF
import io

merge_pdf_bp = Blueprint("merge_pdf", __name__)


@merge_pdf_bp.route("/merge-pdf", methods=["POST"])
def merge_pdfs():
    files = request.files.getlist("files")

    if not files or len(files) < 2:
        return jsonify({"error": "Please upload at least 2 PDF files."}), 400

    merged = fitz.open()

    try:
        for f in files:
            if not f.filename.lower().endswith(".pdf"):
                return jsonify({"error": f"'{f.filename}' is not a PDF file."}), 400

            data = f.read()
            src = fitz.open(stream=data, filetype="pdf")
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