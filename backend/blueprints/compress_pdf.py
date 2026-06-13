from flask import Blueprint, request, send_file, jsonify
import fitz  # PyMuPDF
import io
from utils.validators import validate_uploaded_file, validate_pdf_file

compress_pdf_bp = Blueprint("compress_pdf", __name__)


@compress_pdf_bp.route("/compress-pdf", methods=["POST"])
def compress_pdf():
    file, filename, upload_error = validate_uploaded_file(request, "file")
    if upload_error:
        return upload_error

    pdf_error = validate_pdf_file(filename)
    if pdf_error:
        return pdf_error

    level = request.form.get("level", "medium")

    garbage_map = {"low": 1, "medium": 3, "high": 4}
    garbage = garbage_map.get(level, 3)
    deflate = level in ["medium", "high"]

    data = file.read()
    doc = None

    try:
        doc = fitz.open(stream=data, filetype="pdf")

        buf = io.BytesIO()
        doc.save(buf, garbage=garbage, deflate=deflate, clean=True)
        buf.seek(0)

        base_name = filename.rsplit(".", 1)[0] or "document"
        download_name = f"{base_name}_compressed.pdf"

        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name,
        )

    except fitz.FileDataError:
        return jsonify({"error": "The uploaded file appears to be corrupted or is not a valid PDF."}), 400

    except Exception as e:
        return jsonify({"error": f"An error occurred while compressing the PDF: {str(e)}"}), 500

    finally:
        if doc:
            doc.close()