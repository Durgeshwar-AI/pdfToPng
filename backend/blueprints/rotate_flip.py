import io
from flask import Blueprint, request, send_file
from PIL import Image
from utils.decorators import process_image_request

rotate_flip_bp = Blueprint("rotate_flip", __name__)

ALLOWED_ACTIONS = {"rotate_left", "rotate_right", "flip_h", "flip_v"}
ALLOWED_FORMATS = {"PNG", "JPEG", "WEBP"}


@rotate_flip_bp.route("/rotateFlip", methods=["POST"])
@process_image_request
def rotate_flip(img, filename, file_bytes):
    action = request.form.get("action", "")
    fmt    = request.form.get("format", "PNG").upper()

    if fmt == "JPG":
        fmt = "JPEG"

    if action not in ALLOWED_ACTIONS:
        raise ValueError(f"Invalid action: {action}")
    if fmt not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported format: {fmt}")

    if img.mode != "RGBA":
        img = img.convert("RGBA")

    if action == "rotate_left":
        img = img.rotate(90, expand=True)
    elif action == "rotate_right":
        img = img.rotate(-90, expand=True)
    elif action == "flip_h":
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    elif action == "flip_v":
        img = img.transpose(Image.FLIP_TOP_BOTTOM)

    # JPEG has no alpha channel — composite onto white background
    if fmt == "JPEG" and img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg

    output = io.BytesIO()
    img.save(output, format=fmt)
    output.seek(0)

    mime = "image/jpeg" if fmt == "JPEG" else f"image/{fmt.lower()}"
    ext  = "jpg"        if fmt == "JPEG" else fmt.lower()
    return send_file(output, mimetype=mime,
                     download_name=f"transformed.{ext}")
