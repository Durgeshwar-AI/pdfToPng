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
