import io
import os

from flask import Blueprint, request, send_file
from PIL import Image

from utils.helpers import error
from werkzeug.utils import secure_filename

image_bp = Blueprint("image", __name__)


@image_bp.route("/convertWebP", methods=["POST"])
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
            download_name=f"{base}.webp",
        )

    except Exception as e:
        return error(str(e), 500)


@image_bp.route("/ocr", methods=["POST"])
def extract_text():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        img = Image.open(file)
        
        import pytesseract
        # On Windows, user might need to point to tesseract.exe
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        
        text = pytesseract.image_to_string(img)
        
        return {
            "success": True,
            "text": text,
            "filename": file.filename
        }
    except Exception as e:
        return error(str(e), 500)


@image_bp.route("/convertJpeg", methods=["POST"])
def convert_to_jpeg():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        if img.mode != "RGB":
            img = img.convert("RGB")

        out = io.BytesIO()
        img.save(out, format="JPEG", quality=90, optimize=True)
        out.seek(0)

        base = os.path.splitext(filename)[0]

        return send_file(
            out,
            mimetype="image/jpeg",
            as_attachment=True,
            download_name=f"{base}.jpg",
        )

    except Exception as e:
        return error(str(e), 500)


@image_bp.route('/batchConvert', methods=['POST'])
def batch_convert():
    import zipfile
    import io
    temp_zip_path = None
    try:
        files = request.files.getlist('images')
        target_format = request.form.get('format', 'webp').upper()
        if not files: return error('No images provided')
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as temp_zip:
            temp_zip_path = temp_zip.name
        with zipfile.ZipFile(temp_zip_path, 'w') as zf:
            for file in files:
                img = Image.open(file)
                img_io = io.BytesIO()
                if target_format == 'JPEG' and img.mode != 'RGB': img = img.convert('RGB')
                img.save(img_io, format=target_format)
                img_io.seek(0)
                filename = os.path.splitext(secure_filename(file.filename))[0] + f'.{target_format.lower()}'
                zf.writestr(filename, img_io.getvalue())
        return send_file_and_cleanup(temp_zip_path, mimetype='application/zip', as_attachment=True, download_name='converted_images.zip')
    except Exception as e:
        if temp_zip_path and os.path.exists(temp_zip_path): os.remove(temp_zip_path)
        return error(str(e), 500)
