import os
import tempfile

from flask import Blueprint, request
from PIL import Image

from utils.helpers import error, send_file_and_cleanup
from werkzeug.utils import secure_filename

image_bp = Blueprint("image", __name__)


@image_bp.route("/convertWebP", methods=["POST"])
def convert_to_webp():
    temp_webp_path = None
    img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        try:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA")

            with tempfile.NamedTemporaryFile(delete=False, suffix=".webp") as temp_webp:
                temp_webp_path = temp_webp.name
            
            img.save(temp_webp_path, format="WEBP", quality=85, method=6)

            base = os.path.splitext(filename)[0]

            return send_file_and_cleanup(
                temp_webp_path,
                mimetype="image/webp",
                as_attachment=True,
                download_name=f"{base}.webp",
            )
        finally:
            if img:
                img.close()

    except Exception as e:
        if temp_webp_path and os.path.exists(temp_webp_path):
            os.remove(temp_webp_path)
        return error(str(e), 500)


@image_bp.route("/convertJpeg", methods=["POST"])
def convert_to_jpeg():
    temp_jpeg_path = None
    img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        try:
            if img.mode != "RGB":
                img = img.convert("RGB")

            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_jpeg:
                temp_jpeg_path = temp_jpeg.name
            
            img.save(temp_jpeg_path, format="JPEG", quality=90, optimize=True)

            base = os.path.splitext(filename)[0]

            return send_file_and_cleanup(
                temp_jpeg_path,
                mimetype="image/jpeg",
                as_attachment=True,
                download_name=f"{base}.jpg",
            )
        finally:
            if img:
                img.close()

    except Exception as e:
        if temp_jpeg_path and os.path.exists(temp_jpeg_path):
            os.remove(temp_jpeg_path)
        return error(str(e), 500)
