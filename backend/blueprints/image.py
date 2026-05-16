import os
from io import BytesIO

from flask import Blueprint, request
from PIL import Image, UnidentifiedImageError

from utils.helpers import error, send_file_and_cleanup
from werkzeug.utils import secure_filename

image_bp = Blueprint("image", __name__)


def _parse_positive_int(value, field_name):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a positive integer")

    if parsed <= 0:
        raise ValueError(f"{field_name} must be a positive integer")

    return parsed


def _convert_alpha_to_rgb(img):
    if img.mode in ("RGBA", "LA") or (
        img.mode == "P" and "transparency" in img.info
    ):
        rgba_image = img.convert("RGBA")
        background = Image.new("RGB", rgba_image.size, (255, 255, 255))
        background.paste(rgba_image, mask=rgba_image.getchannel("A"))
        return background

    if img.mode != "RGB":
        return img.convert("RGB")

    return img


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


@image_bp.route("/resizeImage", methods=["POST"])
def resize_image():
    img = None
    resized_img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        width = _parse_positive_int(request.form.get("width"), "width")
        height = _parse_positive_int(request.form.get("height"), "height")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        try:
            img = Image.open(file)
            img.load()
        except UnidentifiedImageError:
            return error("Unsupported or corrupt image", 400)
        except OSError:
            return error("Unsupported or corrupt image", 400)

        original_ext = os.path.splitext(filename)[1].lower()
        format_map = {
            "PNG": ("PNG", "image/png", ".png"),
            "JPEG": ("JPEG", "image/jpeg", ".jpg"),
            "WEBP": ("WEBP", "image/webp", ".webp"),
        }

        if img.format not in format_map:
            return error("Unsupported image format. Please use PNG, JPG, JPEG, or WEBP.", 400)

        output_format, mimetype, default_ext = format_map[img.format]
        output_ext = original_ext if original_ext in {".png", ".jpg", ".jpeg", ".webp"} else default_ext

        if output_format == "JPEG":
            resized_img = _convert_alpha_to_rgb(img.resize((width, height), Image.Resampling.LANCZOS))
        else:
            resized_img = img.resize((width, height), Image.Resampling.LANCZOS)

        buf = BytesIO()
        resized_img.save(buf, format=output_format)
        buf.seek(0)
        data = buf.getvalue()

        base = os.path.splitext(filename)[0] or "image"

        return send_file_and_cleanup(
            data,
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"{base}_resized{output_ext}",
        )

    except ValueError as e:
        return error(str(e), 400)
    except Exception as e:
        return error(str(e), 500)
    finally:
        if resized_img and resized_img is not img:
            resized_img.close()
        if img:
            img.close()
