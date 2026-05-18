import os
import io

from flask import Blueprint, request
from PIL import Image, ImageEnhance, UnidentifiedImageError

from utils.file_handling import temp_upload_file
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


@image_bp.route("/upscale", methods=["POST"])
def upscale_image():
    temp_output_path = None
    img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        scale_factor = request.form.get("scale", 2, type=int)
        
        # Limit scale factor
        scale_factor = max(1, min(4, scale_factor))
        
        filename = secure_filename(file.filename)
        img = Image.open(file)

        try:
            # Upscale using LANCZOS (High quality)
            new_size = (img.width * scale_factor, img.height * scale_factor)
            upscaled = img.resize(new_size, resample=Image.Resampling.LANCZOS)
            
            # Apply Sharpness Enhancement
            enhancer = ImageEnhance.Sharpness(upscaled)
            upscaled = enhancer.enhance(1.5) # Slight boost

            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_out:
                temp_output_path = temp_out.name
            
            upscaled.save(temp_output_path, format="PNG", optimize=True)

            base = os.path.splitext(filename)[0]

            return send_file_and_cleanup(
                temp_output_path,
                mimetype="image/png",
                as_attachment=True,
                download_name=f"{base}_upscaled_{scale_factor}x.png",
            )
        finally:
            if img:
                img.close()

    except Exception as e:
        if temp_output_path and os.path.exists(temp_output_path):
            os.remove(temp_output_path)
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


@image_bp.route("/resizeImage", methods=["POST"])
def resize_image():
    img = None
    resized_img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        unit = request.form.get("unit", "px").lower()
        if unit not in {"px", "mm", "cm"}:
            return error("unit must be one of: px, mm, cm", 400)

        maintain_aspect_ratio = (
            request.form.get("maintainAspectRatio", "false").lower() == "true"
        )

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

        width = _convert_to_pixels(request.form.get("width"), unit, "width")
        if maintain_aspect_ratio:
            height = round(width * img.height / img.width)
            if height <= 0:
                return error("Calculated height must be a positive pixel value", 400)
        else:
            height = _convert_to_pixels(request.form.get("height"), unit, "height")

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
