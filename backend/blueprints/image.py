import os
from io import BytesIO

from flask import Blueprint, request
from PIL import Image

from utils.helpers import error, send_file_and_cleanup
from werkzeug.utils import secure_filename

image_bp = Blueprint("image", __name__)


@image_bp.route("/convertWebP", methods=["POST"])
def convert_to_webp():
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

            buf = BytesIO()
            img.save(buf, format="WEBP", quality=85, method=6)
            buf.seek(0)
            data = buf.getvalue()

            base = os.path.splitext(filename)[0]

            return send_file_and_cleanup(
                data,
                mimetype="image/webp",
                as_attachment=True,
                download_name=f"{base}.webp",
            )
        finally:
            if img:
                img.close()

    except Exception as e:
        return error(str(e), 500)


@image_bp.route("/convertJpeg", methods=["POST"])
def convert_to_jpeg():
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

            buf = BytesIO()
            img.save(buf, format="JPEG", quality=90, optimize=True)
            buf.seek(0)
            data = buf.getvalue()

            base = os.path.splitext(filename)[0]

            return send_file_and_cleanup(
                data,
                mimetype="image/jpeg",
                as_attachment=True,
                download_name=f"{base}.jpg",
            )
        finally:
            if img:
                img.close()

    except Exception as e:
        return error(str(e), 500)


@image_bp.route("/compress", methods=["POST"])
def compress_image():
    img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        quality = request.form.get("quality", 70, type=int)
        
        # Clamp quality between 1 and 100
        quality = max(1, min(100, quality))
        
        filename = secure_filename(file.filename)
        img = Image.open(file)

        try:
            # Determine format - if it's not a format that supports quality, 
            # we'll convert to JPEG for the best compression results
            img_format = img.format if img.format in ["JPEG", "WEBP"] else "JPEG"
            if img_format == "JPEG" and img.mode != "RGB":
                img = img.convert("RGB")
            
            extension = ".jpg" if img_format == "JPEG" else ".webp"
            mimetype = "image/jpeg" if img_format == "JPEG" else "image/webp"

            buf = BytesIO()
            img.save(buf, format=img_format, quality=quality, optimize=True)
            buf.seek(0)
            data = buf.getvalue()

            base = os.path.splitext(filename)[0]

            return send_file_and_cleanup(
                data,
                mimetype=mimetype,
                as_attachment=True,
                download_name=f"{base}_compressed{extension}",
            )
        finally:
            if img:
                img.close()

    except Exception as e:
        return error(str(e), 500)
