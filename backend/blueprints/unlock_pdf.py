from flask import Blueprint, request, send_file
import fitz  # PyMuPDF
import io
from utils.helpers import error
from utils.validators import validate_uploaded_file, validate_pdf_file

unlock_pdf_bp = Blueprint("unlock_pdf", __name__)


@unlock_pdf_bp.route("/unlock-pdf", methods=["POST"])
def unlock_pdf():
    file, filename, upload_error = validate_uploaded_file(request, "file")
    if upload_error:
        return upload_error

    pdf_error = validate_pdf_file(file, filename)
    if pdf_error:
        return pdf_error

    password = request.form.get("password", "").strip()
    if not password:
        return error("Password is required.",400),

    data = file.read()
    doc = None

    try:
        doc = fitz.open(stream=data, filetype="pdf")

        if not doc.is_encrypted:
            return error("This PDF is not password protected.",400),

        if not doc.authenticate(password):
            return error("Incorrect password. Please try again.",401),

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)

        base_name = filename.rsplit(".", 1)[0] or "document"
        download_name = f"{base_name}_unlocked.pdf"

        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name,
        )

    except fitz.FileDataError:
        return error("The uploaded file appears to be corrupted or is not a valid PDF.",400),

    except Exception as e:
        return error("An error occurred while unlocking the PDF: {str(e)}",500),

    finally:
        if doc:
            doc.close()
