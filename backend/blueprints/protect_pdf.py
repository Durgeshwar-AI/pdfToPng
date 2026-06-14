from flask import Blueprint, request, send_file, jsonify
import fitz  # PyMuPDF
import io
from utils.validators import validate_uploaded_file, validate_pdf_file

protect_pdf_bp = Blueprint("protect_pdf", __name__)


@protect_pdf_bp.route("/protect-pdf", methods=["POST"])
def protect_pdf():
    file, filename, upload_error = validate_uploaded_file(request, "file")
    if upload_error:
        return upload_error

    pdf_error = validate_pdf_file(file, filename)
    if pdf_error:
        return pdf_error

    password = request.form.get("password")

    if not password:
        return jsonify({"error": "No password provided."}), 400

    data = file.read()
    src = None

    try:
        src = fitz.open(stream=data, filetype="pdf")

        if src.is_encrypted:
            return jsonify({"error": "The uploaded PDF is already password protected."}), 400

        # Create output stream
        buf = io.BytesIO()
        
        # Save document with encryption
        # owner_pw and user_pw are set to user's password.
        # user_pw is required to open/view the document.
        # owner_pw is required to change permissions.
        src.save(
            buf,
            encryption=fitz.PDF_ENCRYPT_AES_256,
            owner_pw=password,
            user_pw=password
        )
        buf.seek(0)

        base_name = file.filename.rsplit(".", 1)[0] or "document"
        download_name = f"{base_name}_protected.pdf"

        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name,
        )

    except fitz.FileDataError:
        return jsonify({"error": "The uploaded file appears to be corrupted or is not a valid PDF."}), 400

    except Exception as e:
        return jsonify({"error": f"An error occurred while protecting the PDF: {str(e)}"}), 500

    finally:
        if src:
            src.close()
