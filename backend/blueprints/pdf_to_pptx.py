import traceback
from io import BytesIO

import fitz
from pptx import Presentation
from pptx.util import Emu

from flask import Blueprint, request, send_file

from utils.helpers import error, safe_gc_collect
from utils.validators import validate_uploaded_file, validate_pdf_file

pdf_pptx_bp = Blueprint("pdf_pptx", __name__)


@pdf_pptx_bp.route("/convertPptx", methods=["POST"])
def convert_pdf_to_pptx():
    doc = None
    output = None
    try:
        pdf_file, filename, upload_error = validate_uploaded_file(request, "file")
        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(pdf_file, filename)
        if pdf_error:
            return pdf_error

        pdf_bytes = pdf_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if len(doc) == 0:
            return error("PDF file has no pages", 400)

        prs = Presentation()
        prs.slide_width = Emu(int(doc[0].rect.width * 12700))
        prs.slide_height = Emu(int(doc[0].rect.height * 12700))

        layout_index = min(6, len(prs.slide_layouts) - 1)
        blank_layout = prs.slide_layouts[layout_index]

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            mat = fitz.Matrix(200 / 72, 200 / 72)
            pix = page.get_pixmap(matrix=mat, alpha=False)

            img_bytes = BytesIO(pix.tobytes(output="png"))
            slide = prs.slides.add_slide(blank_layout)
            slide.shapes.add_picture(
                img_bytes,
                0, 0,
                prs.slide_width,
                prs.slide_height,
            )
            img_bytes.close()
            pix = None

        output = BytesIO()
        prs.save(output)
        output.seek(0)

        base = filename.rsplit(".", 1)[0]
        download_name = f"{base}.pptx"

        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            as_attachment=True,
            download_name=download_name,
        )

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)

    finally:
        if doc:
            try:
                doc.close()
            except Exception:
                pass
        safe_gc_collect()
