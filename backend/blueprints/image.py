import os
from io import BytesIO

from flask import Blueprint, request
from PIL import Image, ImageEnhance

from utils.decorators import process_image_request, validate_mime
from utils.helpers import send_file_and_cleanup, error
from utils.validators import validate_image_file, validate_uploaded_file

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
@validate_mime('png')  # ✅ Added MIME validation
@process_image_request
def convert_to_webp(img, filename, file_bytes):
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


@image_bp.route("/upscale", methods=["POST"])
@validate_mime('png')  # ✅ Added MIME validation
@process_image_request
def upscale_image(img, filename, file_bytes):
    scale_factor = request.form.get("scale", 2, type=int)

    # Limit scale factor
    scale_factor = max(1, min(4, scale_factor))

    # Upscale using LANCZOS (High quality)
    new_size = (img.width * scale_factor, img.height * scale_factor)
    upscaled = img.resize(new_size, resample=Image.Resampling.LANCZOS)

    # Apply Sharpness Enhancement
    enhancer = ImageEnhance.Sharpness(upscaled)
    upscaled = enhancer.enhance(1.5)

    buf = BytesIO()
    upscaled.save(buf, format="PNG", optimize=True)
    buf.seek(0)

    data = buf.getvalue()

    base = os.path.splitext(filename)[0]

    return send_file_and_cleanup(
        data,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"{base}_upscaled_{scale_factor}x.png",
    )


@image_bp.route("/convertJpeg", methods=["POST"])
@validate_mime('jpg')  # ✅ Added MIME validation
@process_image_request
def convert_to_jpeg(img, filename, file_bytes):
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


@image_bp.route("/convertGrayscale", methods=["POST"])
@validate_mime('png')  # ✅ Added MIME validation
def convert_to_grayscale():
    img = None
    grayscale_img = None

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

        grayscale_img = img.convert("L")

        buf = BytesIO()

        grayscale_img.save(buf, format="PNG")

        buf.seek(0)

        data = buf.getvalue()

        base = os.path.splitext(filename)[0]

        return send_file_and_cleanup(
            data,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}_grayscale.png",
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
@validate_mime('jpg')  # ✅ Added MIME validation
def compress_image():
    img = None

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

        img_format = (
            img.format
            if img.format in ["JPEG", "WEBP", "PNG"]
            else "JPEG"
        )

        if img_format == "JPEG" and img.mode != "RGB":
            img = img.convert("RGB")

        extension_map = {"JPEG": ".jpg", "WEBP": ".webp", "PNG": ".png"}
        mimetype_map = {"JPEG": "image/jpeg", "WEBP": "image/webp", "PNG": "image/png"}

        extension = extension_map[img_format]
        mimetype = mimetype_map[img_format]

        buf = BytesIO()

        save_kwargs = {"format": img_format, "optimize": True}
        if img_format != "PNG":
            save_kwargs["quality"] = quality

        img.save(buf, **save_kwargs)

        buf.seek(0)

        data = buf.getvalue()

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
@validate_mime('jpg')  # ✅ Added MIME validation
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