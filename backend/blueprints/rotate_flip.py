import io
from flask import Blueprint, request, send_file
from PIL import Image
from utils.decorators import process_image_request

rotate_flip_bp = Blueprint("rotate_flip", __name__)

ALLOWED_ACTIONS = {"rotate_left", "rotate_right", "flip_h", "flip_v"}
ALLOWED_FORMATS = {"PNG", "JPEG", "WEBP"}


@rotate_flip_bp.route("/rotateFlip", methods=["POST"])   # ← ONLY ONE
@process_image_request                                    # ← ONLY ONE
def rotate_flip(img, filename, file_bytes):
    # ... rest of code ...
    output = None
    img_copy = None
    
    try:
        action = request.form.get("action", "")
        fmt    = request.form.get("format", "PNG").upper()

        if fmt == "JPG":
            fmt = "JPEG"

        if action not in ALLOWED_ACTIONS:
            raise ValueError(f"Invalid action: {action}")
        if fmt not in ALLOWED_FORMATS:
            raise ValueError(f"Unsupported format: {fmt}")

        # Create a copy to avoid modifying original
        if img.mode != "RGBA":
            img_copy = img.convert("RGBA")
        else:
            img_copy = img.copy()

        if action == "rotate_left":
            img_copy = img_copy.rotate(90, expand=True)
        elif action == "rotate_right":
            img_copy = img_copy.rotate(-90, expand=True)
        elif action == "flip_h":
            img_copy = img_copy.transpose(Image.FLIP_LEFT_RIGHT)
        elif action == "flip_v":
            img_copy = img_copy.transpose(Image.FLIP_TOP_BOTTOM)

        # JPEG has no alpha channel — composite onto white background
        if fmt == "JPEG" and img_copy.mode == "RGBA":
            bg = Image.new("RGB", img_copy.size, (255, 255, 255))
            bg.paste(img_copy, mask=img_copy.split()[3])
            img_copy = bg

        output = io.BytesIO()
        img_copy.save(output, format=fmt)
        output.seek(0)

        mime = "image/jpeg" if fmt == "JPEG" else f"image/{fmt.lower()}"
        ext  = "jpg"        if fmt == "JPEG" else fmt.lower()
        
        return send_file(output, mimetype=mime,
                         download_name=f"transformed.{ext}")
    
    finally:
        # Clean up buffer
        if output:
            try:
                output.close()
            except Exception:
                pass
        
        # Clean up image copy
        if img_copy:
            try:
                img_copy.close()
            except Exception:
                pass