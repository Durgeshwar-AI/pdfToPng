import fitz  # PyMuPDF
import io
import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image
from rembg import remove
from werkzeug.utils import secure_filename

app = Flask(__name__)

allowed_origins_env = os.environ.get("CORS_ALLOWED", "*")
if allowed_origins_env == "*":
    cors_origins = "*"
else:
    cors_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

CORS(
    app,
    resources={r"/*": {"origins": cors_origins}},
)

# ---------------- CONFIG ---------------- #

app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB max upload

# ---------------- HELPERS ---------------- #

def error(msg, code=400):
    return jsonify({"error": msg}), code

# ---------------- ROUTES ---------------- #

@app.route("/convertPng", methods=["POST"])
def convert_pdf():
    try:
        if "file" not in request.files:
            return error("No file provided")

        pdf_file = request.files["file"]

        if pdf_file.filename == "":
            return error("No file selected")

        filename = secure_filename(pdf_file.filename)
        base = os.path.splitext(filename)[0]

        pdf_bytes = pdf_file.read()
        if not pdf_bytes:
            return error("Empty PDF")

        # Open PDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if doc.page_count == 0:
            doc.close()
            return error("PDF has no pages")

        page = doc.load_page(0)

        # 🔥 HIGH QUALITY RENDER (300 DPI)
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix, alpha=True)

        img_bytes = io.BytesIO(pix.tobytes("png"))
        img_bytes.seek(0)

        doc.close()

        return send_file(
            img_bytes,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}.png",
        )

    except Exception as e:
        return error(str(e), 500)

# ------------------------------------------------ #

@app.route("/convertWebP", methods=["POST"])
def convert_to_webp():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        # 🔥 Ensure proper mode
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")

        webp_io = io.BytesIO()
        img.save(
            webp_io,
            format="WEBP",
            quality=90,
            method=6,
            lossless=False
        )
        webp_io.seek(0)

        base = os.path.splitext(filename)[0]

        return send_file(
            webp_io,
            mimetype="image/webp",
            as_attachment=True,
            download_name=f"{base}.webp",
        )

    except Exception as e:
        return error(str(e), 500)

# ------------------------------------------------ #

@app.route("/removeBg", methods=["POST"])
def remove_background():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        input_image = Image.open(file)

        # 🔥 rembg prefers RGB
        if input_image.mode != "RGB":
            input_image = input_image.convert("RGB")

        output_image = remove(input_image)

        output_io = io.BytesIO()
        output_image.save(output_io, format="PNG")
        output_io.seek(0)

        base = os.path.splitext(filename)[0]

        return send_file(
            output_io,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}_no_bg.png",
        )

    except Exception as e:
        return error(str(e), 500)

# ---------------- RUN ---------------- #

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
