import fitz
from io import BytesIO
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

import traceback

from flask import Blueprint, request, send_file

from utils.helpers import error, safe_gc_collect
from utils.validators import MAX_PDF_SIZE, validate_uploaded_file, validate_pdf_file

try:
    import pytesseract
    from PIL import Image as PILImage
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

pdf_docx_bp = Blueprint("pdf_docx", __name__)


def extract_table_to_docx(docx_doc, page, table):
    data = table.extract()

    if not data or len(data) < 1:
        return

    rows = len(data)
    cols = max(len(row) for row in data) if data else 0

    if rows == 0 or cols == 0:
        return

    table_docx = docx_doc.add_table(rows=rows, cols=cols)
    table_docx.alignment = WD_TABLE_ALIGNMENT.CENTER

    for r in range(rows):
        for c in range(cols):
            cell_text = str(data[r][c]) if c < len(data[r]) else ""
            docx_cell = table_docx.cell(r, c)
            p = docx_cell.paragraphs[0]
            run = p.add_run(cell_text)
            run.font.size = Pt(9)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT

    docx_doc.add_paragraph()


def extract_images_to_docx(docx_doc, page, doc):
    images = page.get_images(full=True)
    for img_index, img in enumerate(images):
        try:
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]

            if image_ext in ("png", "jpeg", "jpg", "bmp", "tiff"):
                image_stream = BytesIO(image_bytes)
                docx_doc.add_picture(image_stream, width=Inches(5.5))
                docx_doc.add_paragraph()
        except Exception:
            continue


def add_text_with_formatting(docx_doc, page):
    blocks = page.get_text("dict")["blocks"]
    for block in blocks:
        if "lines" not in block:
            continue

        for line in block["lines"]:
            p = docx_doc.add_paragraph()
            for span in line["spans"]:
                run = p.add_run(span["text"])
                run.font.size = Pt(span["size"])
                run.font.name = span["font"]
                if span["flags"] & 16:
                    run.bold = True
                if span["flags"] & 2:
                    run.italic = True
                color = span["color"]
                if color:
                    r = (color >> 16) & 255
                    g = (color >> 8) & 255
                    b = color & 255
                    run.font.color.rgb = RGBColor(r, g, b)


def ocr_page_text(page, lang="eng"):
    if not HAS_OCR:
        return ""
    try:
        pix = page.get_pixmap(dpi=300)
        img = PILImage.frombytes("RGB", [pix.width, pix.height], pix.samples)
        text = pytesseract.image_to_string(img, lang=lang)
        return text.strip()
    except Exception:
        return ""


@pdf_docx_bp.route("/convertDocx", methods=["POST"])
def convert_pdf_to_docx():
    doc = None
    try:
        file, filename, upload_error = validate_uploaded_file(request, "file")
        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(file, filename)
        if pdf_error:
            return pdf_error

        pdf_bytes = file.read()

        if len(pdf_bytes) > MAX_PDF_SIZE:
            return error(
                f"File exceeds the maximum size of {MAX_PDF_SIZE // (1024 * 1024)}MB.",
                413,
            )

        password = request.form.get("password", "")
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if password:
            if doc.needs_pass:
                auth = doc.authenticate(password)
                if not auth:
                    return error("Invalid password for PDF", 401)

        if doc.page_count == 0:
            return error("Empty PDF", 400)

        extract_tables = request.form.get("extract_tables", "true").lower() == "true"
        extract_images = request.form.get("extract_images", "true").lower() == "true"
        preserve_formatting = request.form.get("preserve_formatting", "true").lower() == "true"
        ocr_enabled = request.form.get("ocr_enabled", "false").lower() == "true"
        ocr_language = request.form.get("ocr_language", "eng")
        page_range = request.form.get("page_range", "")

        word_doc = Document()

        pages_to_process = []
        if page_range:
            for part in page_range.split(","):
                part = part.strip()
                if "-" in part:
                    start, end = map(int, part.split("-"))
                    pages_to_process.extend(range(start - 1, min(end, doc.page_count)))
                else:
                    page_num = int(part) - 1
                    if 0 <= page_num < doc.page_count:
                        pages_to_process.append(page_num)
            pages_to_process = sorted(set(pages_to_process))
        else:
            pages_to_process = list(range(doc.page_count))

        for i, page_num in enumerate(pages_to_process):
            page = doc.load_page(page_num)

            if extract_tables:
                tables = page.find_tables()
                if tables.tables:
                    for table in tables:
                        extract_table_to_docx(word_doc, page, table)

            if extract_images:
                extract_images_to_docx(word_doc, page, doc)

            text = page.get_text("text")
            if not text.strip() and ocr_enabled:
                text = ocr_page_text(page, ocr_language)

            if preserve_formatting and text.strip():
                add_text_with_formatting(word_doc, page)
            elif text.strip():
                word_doc.add_paragraph(text)

            if i < len(pages_to_process) - 1:
                word_doc.add_page_break()

        output = BytesIO()
        word_doc.save(output)
        output.seek(0)

        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename.replace(".pdf", ".docx"),
        )

    except ValueError as e:
        return error(str(e), 400)

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
