import os
import subprocess
import tempfile
import traceback
from io import BytesIO

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup

docx_pdf_bp = Blueprint("docx_pdf", __name__)


@docx_pdf_bp.route("/convertDocxToPdf", methods=["POST"])
def convert_docx_to_pdf():
    try:
        if "file" not in request.files:
            return error("No file provided")

        docx_file = request.files["file"]

        if docx_file.filename == "":
            return error("No file selected")

        docx_bytes = docx_file.read()

        # Use LibreOffice for high-fidelity conversion
        with tempfile.TemporaryDirectory() as tmp_dir:
            input_path = os.path.join(tmp_dir, "document.docx")
            with open(input_path, "wb") as f:
                f.write(docx_bytes)

            try:
                # Execute LibreOffice headless conversion
                # Using --convert-to pdf --outdir
                result = subprocess.run(
                    [
                        "libreoffice",
                        "--headless",
                        "--convert-to",
                        "pdf",
                        "--outdir",
                        tmp_dir,
                        input_path,
                    ],
                    capture_output=True,
                    text=True,
                    timeout=60,  # 60 second timeout
                )

                if result.returncode != 0:
                    print(f"LibreOffice error: {result.stderr}")
                    return error(f"Conversion failed: {result.stderr}", 500)

                # LibreOffice names the output file same as input but with .pdf extension
                pdf_path = os.path.join(tmp_dir, "document.pdf")
                
                if not os.path.exists(pdf_path):
                    return error("Conversion failed: PDF not generated", 500)

                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()

                output = BytesIO(pdf_bytes)
                output.seek(0)

                return send_file_and_cleanup(
                    output,
                    mimetype="application/pdf",
                    as_attachment=True,
                    download_name="converted.pdf",
                )

            except subprocess.TimeoutExpired:
                return error("Conversion timed out", 500)
            except Exception as e:
                traceback.print_exc()
                return error(f"Error during conversion: {str(e)}", 500)

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)
