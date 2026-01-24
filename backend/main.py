import fitz  # PyMuPDF
import io
import os
import tempfile

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image
from rembg import remove
from werkzeug.utils import secure_filename

# ---------------- APP ---------------- #

app = Flask(__name__)
CORS(app)

# ---------------- CONFIG ---------------- #

# 10 MB limit (Render free safe)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

# ---------------- HELPERS ---------------- #

def error(msg, code=400):
    return jsonify({"error": msg}), code

# ---------------- HEALTH ---------------- #

@app.route("/health", methods=["GET"])
def health():
    return "ok", 200

# ---------------- PDF → PNG ---------------- #

@app.route('/convertPng', methods=['POST'])
def convert_pdf_to_png():
    try:
        if 'file' not in request.files:
            return error("No file provided")

        pdf_file = request.files['file']

        if pdf_file.filename == '':
            return error("No file selected")

        # Save PDF to temp file (prevents memory spike)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_file.save(tmp.name)
            pdf_path = tmp.name

        # Open PDF
        doc = fitz.open(pdf_path)

        if len(doc) == 0:
            os.remove(pdf_path)
            return error("Empty PDF")

        # Render first page
        page = doc.load_page(0)
        pix = page.get_pixmap()

        img_io = io.BytesIO(pix.tobytes("png"))
        img_io.seek(0)

        # Cleanup
        doc.close()
        os.remove(pdf_path)

        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name='converted.png'
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

# ---------------- REMOVE BACKGROUND ---------------- #

@app.route("/removeBg", methods=["POST"])
def remove_background():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        if img.mode != "RGB":
            img = img.convert("RGB")

        output = remove(img)

        out_io = io.BytesIO()
        output.save(out_io, format="PNG")
        out_io.seek(0)

        base = os.path.splitext(filename)[0]

        return send_file(
            out_io,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}_no_bg.png",
        )

    except Exception as e:
        return error(str(e), 500)

# ---------------- RUN (LOCAL ONLY) ---------------- #

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
