import os
import tempfile
from io import BytesIO

from flask import Blueprint, request
from PIL import Image, ImageEnhance

from utils.helpers import error, send_file_and_cleanup, log_memory
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


def _parse_positive_number(value, field_name):
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a positive number")

    if parsed <= 0:
        raise ValueError(f"{field_name} must be a positive number")

    return parsed


def _convert_to_pixels(value, unit, field_name):
    if unit == "px":
        return _parse_positive_int(value, field_name)

    parsed_value = _parse_positive_number(value, field_name)
    unit_per_inch = 25.4 if unit == "mm" else 2.54
    pixels = round(parsed_value * 96 / unit_per_inch)

    if pixels <= 0:
        raise ValueError(f"{field_name} must convert to a positive pixel value")

    return pixels


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
    try:
        scale_factor = request.form.get("scale", 2, type=int)

        # Limit scale factor
        scale_factor = max(1, min(4, scale_factor))

        log_memory("convertWebP - before open")
        with Image.open(file) as img:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA")

            with BytesIO() as buf:
                img.save(buf, format="WEBP", quality=85, method=6)
                buf.seek(0)
                data = buf.getvalue()

        log_memory("convertWebP - before return")

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
        file, filename, upload_error = validate_uploaded_file(
            request,
            "image",
        )

        if upload_error:
            return upload_error

        log_memory("convertJpeg - before open")
        with Image.open(file) as img:
            if img.mode != "RGB":
                img = img.convert("RGB")

            with BytesIO() as buf:
                img.save(buf, format="JPEG", quality=90, optimize=True)
                buf.seek(0)
                data = buf.getvalue()

        log_memory("convertJpeg - before return")

        base = os.path.splitext(filename)[0]

        return send_file_and_cleanup(
            data,
            mimetype="image/jpeg",
            as_attachment=True,
            download_name=f"{base}.jpg",
        )
    except Exception as e:
        return error(str(e), 500)

    finally:
        if grayscale_img:
            try:
                grayscale_img.close()
            except Exception:
                pass

        if img:
            try:
                img.close()
            except Exception:
                pass


@image_bp.route("/compress", methods=["POST"])
def compress_image():
    try:
        file, filename, upload_error = validate_uploaded_file(
            request,
            "image",
        )

        if upload_error:
            return upload_error

        img, file_bytes, image_error = validate_image_file(file)

        if image_error:
            return image_error

        quality = request.form.get("quality", 70, type=int)

        quality = max(1, min(100, quality))
        
        filename = secure_filename(file.filename)

        log_memory("compress - before open")
        with Image.open(file) as img:
            # Determine format - if it's not a format that supports quality, 
            # we'll convert to JPEG for the best compression results
            img_format = img.format if img.format in ["JPEG", "WEBP"] else "JPEG"
            if img_format == "JPEG" and img.mode != "RGB":
                img = img.convert("RGB")
            
            extension = ".jpg" if img_format == "JPEG" else ".webp"
            mimetype = "image/jpeg" if img_format == "JPEG" else "image/webp"

            with BytesIO() as buf:
                img.save(buf, format=img_format, quality=quality, optimize=True)
                buf.seek(0)
                data = buf.getvalue()

        log_memory("compress - before return")

        base = os.path.splitext(filename)[0]

        return send_file_and_cleanup(
            data,
            mimetype=mimetype,
            as_attachment=True,
            download_name=f"{base}_compressed{extension}",
        )
    except Exception as e:
        return error(str(e), 500)

    finally:
        if img:
            try:
                img.close()
            except Exception:
                pass


@image_bp.route("/resizeImage", methods=["POST"])
@process_image_request
def resize_image(img, filename, file_bytes):
    unit = request.form.get("unit", "px").lower()
    if unit not in {"px", "mm", "cm"}:
        raise ValueError("unit must be one of: px, mm, cm")

    maintain_aspect_ratio = (
        request.form.get("maintainAspectRatio", "false").lower() == "true"
    )

    original_ext = os.path.splitext(filename)[1].lower()
    format_map = {
        "PNG": ("PNG", "image/png", ".png"),
        "JPEG": ("JPEG", "image/jpeg", ".jpg"),
        "WEBP": ("WEBP", "image/webp", ".webp"),
    }

    if img.format not in format_map:
        raise ValueError("Unsupported image format. Please use PNG, JPG, JPEG, or WEBP.")

    width = _convert_to_pixels(request.form.get("width"), unit, "width")
    if maintain_aspect_ratio:
        height = round(width * img.height / img.width)
        if height <= 0:
            raise ValueError("Calculated height must be a positive pixel value")
    else:
        height = _convert_to_pixels(request.form.get("height"), unit, "height")

    output_format, mimetype, default_ext = format_map[img.format]
    output_ext = original_ext if original_ext in {".png", ".jpg", ".jpeg", ".webp"} else default_ext

    resized_img = None
    try:
        if output_format == "JPEG":
            resized_img = _convert_alpha_to_rgb(img.resize((width, height), Image.Resampling.LANCZOS))
        else:
            resized_img = img.resize((width, height), Image.Resampling.LANCZOS)

        buf = BytesIO()
        resized_img.save(buf, format=output_format)
        buf.seek(0)
        data = buf.getvalue()
    finally:
        if resized_img and resized_img is not img:
            try:
                resized_img.close()
            except Exception:
                pass

    base = os.path.splitext(filename)[0] or "image"

    return send_file_and_cleanup(
        data,
        mimetype=mimetype,
        as_attachment=True,
        download_name=f"{base}_resized{output_ext}",
    )
