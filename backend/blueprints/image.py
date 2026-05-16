import os
import io

from flask import Blueprint, request
from PIL import Image

from utils.file_handling import temp_upload_file
from utils.helpers import error, send_file_and_cleanup
from werkzeug.utils import secure_filename

image_bp = Blueprint("image", __name__)


@image_bp.route("/convertWebP", methods=["POST"])
def convert_to_webp():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        with temp_upload_file(file) as temp_path:
            with Image.open(temp_path) as img:
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGBA")

                out = io.BytesIO()
                img.save(out, format="WEBP", quality=85, method=6)
                data = out.getvalue()

        base = os.path.splitext(filename)[0]

        return send_file_and_cleanup(
            data,
            mimetype="image/webp",
            as_attachment=True,
            download_name=f"{base}.webp",
        )

    except Exception as e:
        return error(str(e), 500)


@image_bp.route("/convertJpeg", methods=["POST"])
def convert_to_jpeg():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        with temp_upload_file(file) as temp_path:
            with Image.open(temp_path) as img:
                if img.mode != "RGB":
                    img = img.convert("RGB")

                out = io.BytesIO()
                img.save(out, format="JPEG", quality=90, optimize=True)
                data = out.getvalue()

        base = os.path.splitext(filename)[0]

        return send_file_and_cleanup(
            data,
            mimetype="image/jpeg",
            as_attachment=True,
            download_name=f"{base}.jpg",
        )

    except Exception as e:
        return error(str(e), 500)


@image_bp.route("/compress", methods=["POST"])
def compress_image():
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        quality = request.form.get("quality", 70, type=int)
        
        # Clamp quality between 1 and 100
        quality = max(1, min(100, quality))
        
        filename = secure_filename(file.filename)

        with temp_upload_file(file) as temp_path:
            with Image.open(temp_path) as img:
                # Determine format - if it's not a format that supports quality, 
                # we'll convert to JPEG for the best compression results
                img_format = img.format if img.format in ["JPEG", "WEBP"] else "JPEG"
                if img_format == "JPEG" and img.mode != "RGB":
                    img = img.convert("RGB")
                
                extension = ".jpg" if img_format == "JPEG" else ".webp"
                mimetype = "image/jpeg" if img_format == "JPEG" else "image/webp"

                out = io.BytesIO()
                img.save(out, format=img_format, quality=quality, optimize=True)
                data = out.getvalue()

        base = os.path.splitext(filename)[0]

        return send_file_and_cleanup(
            data,
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"{base}_compressed{extension}",
        )

    except Exception as e:
        return error(str(e), 500)
