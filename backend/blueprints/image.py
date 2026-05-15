import io
import os

from flask import Blueprint, request, send_file
from PIL import Image

from utils.helpers import error
from werkzeug.utils import secure_filename

image_bp = Blueprint("image", __name__)

# Image MIME types accepted for conversion
_ALLOWED_IMAGE_MIMES = {
    "image/png", "image/jpeg", "image/gif", "image/bmp",
    "image/tiff", "image/webp", "image/svg+xml",
}


def _validate_image_file(file):
    """Validate that the upload is a non-empty image file.

    Returns (filename_base, error_response) — error_response is None on success.
    """
    if not file or file.filename == "":
        return None, error("No image provided", 400)

    # Content-type check (lightweight guard before opening the file)
    if file.content_type and file.content_type not in _ALLOWED_IMAGE_MIMES:
        return None, error(
            f"Unsupported file type '{file.content_type}'. Please upload an image file.",
            400,
        )

    filename = secure_filename(file.filename)
    # secure_filename strips all non-ASCII chars; fall back to a safe default
    base = os.path.splitext(filename)[0] if filename else "converted"

    return base, None


@image_bp.route("/convertWebP", methods=["POST"])
def convert_to_webp():
    try:
        file = request.files.get("image")
        base, err = _validate_image_file(file)
        if err:
            return err

        img = Image.open(file)

        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")

        out = io.BytesIO()
        img.save(out, format="WEBP", quality=85, method=6)
        out.seek(0)

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
        file = request.files.get("image")
        base, err = _validate_image_file(file)
        if err:
            return err

        img = Image.open(file)

        if img.mode != "RGB":
            img = img.convert("RGB")

        out = io.BytesIO()
        img.save(out, format="JPEG", quality=90, optimize=True)
        out.seek(0)

        return send_file(
            out,
            mimetype="image/jpeg",
            as_attachment=True,
            download_name=f"{base}.jpg",
        )

    except Exception as e:
        return error(str(e), 500)
