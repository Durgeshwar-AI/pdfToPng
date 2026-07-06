from flask import Blueprint, request, send_file, jsonify
import io
import fitz
import pytesseract
from PIL import Image
import cv2
import numpy as np

searchable_pdf_ocr_bp = Blueprint("searchable_pdf_ocr", __name__)


def preprocess_image(pil_image, mode="balanced"):
    image = np.array(pil_image.convert("RGB"))
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    if mode == "none":
        return pil_image.convert("RGB")

    if mode == "light":
        processed = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    elif mode == "strong":
        denoised = cv2.fastNlMeansDenoising(gray, None, 30, 7, 21)
        processed = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 31, 11
        )
    else:
        denoised = cv2.fastNlMeansDenoising(gray, None, 20, 7, 21)
        processed = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 25, 15
        )

    return Image.fromarray(processed).convert("RGB")


@searchable_pdf_ocr_bp.route("/searchable-pdf-ocr", methods=["POST"])
def searchable_pdf_ocr():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded."}), 400

    file = request.files["file"]
    filename = file.filename or ""

    if not filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please upload a PDF file."}), 400

    language = request.form.get("language", "eng").strip() or "eng"
    preprocess_mode = request.form.get("preprocess", "balanced").strip() or "balanced"

    if preprocess_mode not in {"none", "light", "balanced", "strong"}:
        return jsonify({"error": "Invalid preprocessing mode."}), 400

    source_doc = None
    output_doc = fitz.open()

    try:
        pdf_bytes = file.read()
        source_doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if source_doc.page_count == 0:
            return jsonify({"error": "The uploaded PDF has no pages."}), 400

        for page in source_doc:
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            pil_image = Image.open(io.BytesIO(pix.tobytes("png")))
            processed_image = preprocess_image(pil_image, preprocess_mode)

            ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(
                processed_image,
                extension="pdf",
                lang=language,
            )

            page_doc = fitz.open(stream=ocr_pdf_bytes, filetype="pdf")
            output_doc.insert_pdf(page_doc)
            page_doc.close()

        output_buffer = io.BytesIO()
        output_doc.save(output_buffer, garbage=3, deflate=True)
        output_buffer.seek(0)

        base_name = filename.rsplit(".", 1)[0] or "document"

        return send_file(
            output_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"{base_name}_searchable.pdf",
        )

    except Exception as exc:
        return jsonify({"error": f"Failed to create searchable PDF: {str(exc)}"}), 500
    finally:
        if source_doc:
            source_doc.close()
        output_doc.close()
