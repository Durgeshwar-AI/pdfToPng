import io
import fitz  # PyMuPDF
from flask import Blueprint, request, send_file, jsonify
from PIL import Image
from utils.decorators import process_image_request

rotate_flip_bp = Blueprint("rotate_flip", __name__)

ALLOWED_ACTIONS = {"rotate_left", "rotate_right", "flip_h", "flip_v"}
ALLOWED_FORMATS = {"PNG", "JPEG", "WEBP"}


def _parse_page_selection(pages_raw, total_pages):
    if not pages_raw or not pages_raw.strip():
        raise ValueError("Page selection is required when scope is 'selection'.")

    selected = set()
    tokens = [token.strip() for token in pages_raw.split(",") if token.strip()]

    if not tokens:
        raise ValueError("No valid page tokens found. Use values like 1,3,7 or 1-10.")

    for token in tokens:
        if "-" in token:
            parts = token.split("-", 1)
            if len(parts) != 2:
                raise ValueError(f"Invalid page range token: {token}")
            try:
                start = int(parts[0])
                end = int(parts[1])
            except ValueError as exc:
                raise ValueError(f"Invalid page range token: {token}") from exc

            if start > end:
                raise ValueError(f"Range start cannot exceed end: {token}")
            if start < 1 or end > total_pages:
                raise ValueError(
                    f"Range {token} is out of bounds. Valid pages are 1-{total_pages}."
                )
            selected.update(range(start, end + 1))
        else:
            try:
                page_num = int(token)
            except ValueError as exc:
                raise ValueError(f"Invalid page number token: {token}") from exc

            if page_num < 1 or page_num > total_pages:
                raise ValueError(
                    f"Page {page_num} is out of bounds. Valid pages are 1-{total_pages}."
                )
            selected.add(page_num)

    return sorted(selected)


@rotate_flip_bp.route("/rotateFlip", methods=["POST"])
@process_image_request
def rotate_flip(img, filename, file_bytes):
    action = request.form.get("action", "")
    fmt    = request.form.get("format", "PNG").upper()

    if fmt == "JPG":
        fmt = "JPEG"

    if action not in ALLOWED_ACTIONS:
        raise ValueError(f"Invalid action: {action}")
    if fmt not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported format: {fmt}")

    if img.mode != "RGBA":
        img = img.convert("RGBA")

    if action == "rotate_left":
        img = img.rotate(90, expand=True)
    elif action == "rotate_right":
        img = img.rotate(-90, expand=True)
    elif action == "flip_h":
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    elif action == "flip_v":
        img = img.transpose(Image.FLIP_TOP_BOTTOM)

    # JPEG has no alpha channel — composite onto white background
    if fmt == "JPEG" and img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg

    output = io.BytesIO()
    img.save(output, format=fmt)
    output.seek(0)

    mime = "image/jpeg" if fmt == "JPEG" else f"image/{fmt.lower()}"
    ext  = "jpg"        if fmt == "JPEG" else fmt.lower()
    return send_file(output, mimetype=mime,
                     download_name=f"transformed.{ext}")


@rotate_flip_bp.route("/rotateFlipPdf", methods=["POST"])
def rotate_flip_pdf():
    pdf_file = request.files.get("file")
    action = request.form.get("action", "")
    scope = request.form.get("scope", "all").strip().lower()
    pages_raw = request.form.get("pages", "")

    if not pdf_file or pdf_file.filename == "":
        return jsonify({"error": "No file provided."}), 400
    if not pdf_file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted."}), 400
    if action not in ALLOWED_ACTIONS:
        return jsonify({"error": f"Invalid action: {action}"}), 400
    if scope not in {"all", "selection"}:
        return jsonify({"error": "Invalid scope. Use 'all' or 'selection'."}), 400

    data = pdf_file.read()
    src = None
    out = None

    try:
        src = fitz.open(stream=data, filetype="pdf")
        total_pages = src.page_count
        if total_pages == 0:
            return jsonify({"error": "The uploaded PDF is empty."}), 400

        if scope == "all":
            target_pages = list(range(1, total_pages + 1))
        else:
            target_pages = _parse_page_selection(pages_raw, total_pages)

        out = fitz.open()
        out.insert_pdf(src)

        for page_num in target_pages:
            page = out[page_num - 1]
            rect = page.rect
            x_mid = rect.x0 + (rect.width / 2)
            y_mid = rect.y0 + (rect.height / 2)

            if action == "rotate_left":
                page.set_rotation((page.rotation + 90) % 360)
            elif action == "rotate_right":
                page.set_rotation((page.rotation - 90) % 360)
            elif action == "flip_h":
                matrix = fitz.Matrix(-1, 0, 0, 1, 2 * x_mid, 0)
                page.apply_transform(matrix)
            elif action == "flip_v":
                matrix = fitz.Matrix(1, 0, 0, -1, 0, 2 * y_mid)
                page.apply_transform(matrix)

        output = io.BytesIO()
        out.save(output)
        output.seek(0)

        base_name = pdf_file.filename.rsplit(".", 1)[0] or "document"
        download_name = f"{base_name}_transformed.pdf"
        return send_file(
            output,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name,
        )
    except fitz.FileDataError:
        return jsonify(
            {"error": "The uploaded file appears corrupted or is not a valid PDF."}
        ), 400
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        return jsonify({"error": "Failed to rotate/flip PDF pages."}), 500
    finally:
        if src:
            src.close()
        if out:
            out.close()
