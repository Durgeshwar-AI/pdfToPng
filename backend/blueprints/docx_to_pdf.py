from io import BytesIO
import traceback
from xml.sax.saxutils import escape

from flask import Blueprint, request
from docx import Document

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

        # Load docx from bytes
        doc = Document(BytesIO(docx_bytes))

        # Build PDF in memory using ReportLab Platypus (import lazily)
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        except ImportError:
            return error("Server missing 'reportlab' library; install reportlab to enable DOCX→PDF conversion", 500)

        output = BytesIO()
        pdf_doc = SimpleDocTemplate(output, pagesize=A4)
        styles = getSampleStyleSheet()
        normal = styles["Normal"]

        story = []

        for para in doc.paragraphs:
            text = para.text or ""
            if not text.strip():
                # keep paragraph spacing
                story.append(Spacer(1, 6))
                continue
            # Use Paragraph to support simple wrapping
            safe_text = escape(text)
            story.append(Paragraph(safe_text.replace("\n", "<br/>"), normal))
            story.append(Spacer(1, 6))

        # If no content, return an error
        if not story:
            return error("DOCX contains no extractable text")

        try:
            pdf_doc.build(story)
        except Exception:
            traceback.print_exc()
            return error("Failed to generate PDF", 500)

        output.seek(0)

        return send_file_and_cleanup(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="converted.pdf",
        )

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)
