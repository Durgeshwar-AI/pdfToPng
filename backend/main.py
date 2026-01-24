import fitz  # PyMuPDF
import io
import os

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image
from rembg import remove
from werkzeug.utils import secure_filename

# ---------------- APP ---------------- #

app = Flask(__name__)
CORS(app)

# 10 MB hard limit
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# ---------------- HELPERS ---------------- #

def error(msg, code=400):
    return jsonify({"error": msg}), code

# ---------------- HEALTH ---------------- #

@app.route("/health")
def health():
    return "ok", 200

# ---------------- PDF → PNG (IN MEMORY ONLY) ---------------- #

@app.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    try:
        if "file" not in request.files:
            return error("No file provided")

        pdf_file = request.files["file"]

        if pdf_file.filename == "":
            return error("No file selected")

        # 🔒 Controlled read (stream → bytes)
        pdf_bytes = pdf_file.stream.read()

        if not pdf_bytes:
            return error("Empty PDF")

        # Open PDF from memory
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if doc.page_count == 0:
            return error("Empty PDF")

        # 🔥 VERY IMPORTANT: reduce render cost
        page = doc.load_page(0)

        # Low DPI matrix (Render Free SAFE)
        zoom = 1.0  # default = 72 DPI
        mat = fitz.Matrix(zoom, zoom)

        pix = page.get_pixmap(matrix=mat, alpha=False)

        img_io = io.BytesIO(pix.tobytes("png"))
        img_io.seek(0)

        doc.close()

        return send_file(
            img_io,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return error(str(e), 500)

# ---------------- IMAGE → WEBP ---------------- #

@app.route("/convertWebP", methods=["POST"])
def convert_to_webp():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")

        out = io.BytesIO()
        img.save(out, format="WEBP", quality=85, method=6)
        out.seek(0)

        base = os.path.splitext(filename)[0]

        return send_file(
            out,
            mimetype="image/webp",
            as_attachment=True,
            download_name=f"{base}.webp"
        )

    except Exception as e:
        return error(str(e), 500)

# ---------------- REMOVE BACKGROUND ---------------- #

@app.route("/removeBg", methods=["POST"])
def remove_bg():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        if img.mode != "RGB":
            img = img.convert("RGB")

        output = remove(img)

        out = io.BytesIO()
        output.save(out, format="PNG")
        out.seek(0)

        base = os.path.splitext(filename)[0]

        return send_file(
            out,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}_no_bg.png"
        )

    except Exception as e:
        return error(str(e), 500)

# ---------------- LOCAL RUN ---------------- #

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
