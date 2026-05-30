import os
import tempfile
import threading
from io import BytesIO
from werkzeug.utils import secure_filename

from flask import Blueprint, request, jsonify
from PIL import Image, ImageEnhance

from utils.decorators import process_image_request
from utils.helpers import send_file_and_cleanup, error
from utils.job_registry import job_registry

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


def _process_upscale(job_id, file_bytes, filename, scale_factor):
    temp_output_path = None
    img = None
    try:
        job_registry.update(job_id, progress=5, status="processing",
                            message="Opening image...")
        img = Image.open(BytesIO(file_bytes))

        job_registry.update(job_id, progress=20, status="processing",
                            message=f"Upscaling {scale_factor}x...")
        new_size = (img.width * scale_factor, img.height * scale_factor)
        upscaled = img.resize(new_size, resample=Image.Resampling.LANCZOS)

        job_registry.update(job_id, progress=60, status="processing",
                            message="Enhancing sharpness...")
        enhancer = ImageEnhance.Sharpness(upscaled)
        upscaled = enhancer.enhance(1.5)

        job_registry.update(job_id, progress=80, status="processing",
                            message="Saving result...")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_out:
            temp_output_path = temp_out.name

        upscaled.save(temp_output_path, format="PNG", optimize=True)

        base = os.path.splitext(filename)[0]

        job_registry.update(
            job_id, progress=100, status="completed",
            message="Image upscaled successfully!",
            result_path=temp_output_path, result_mimetype="image/png",
            download_name=f"{base}_upscaled_{scale_factor}x.png",
        )
    except Exception as e:
        if temp_output_path and os.path.exists(temp_output_path):
            try:
                os.remove(temp_output_path)
            except Exception:
                pass
        job_registry.update(job_id, status="failed", message=str(e))
    finally:
        if img:
            try:
                img.close()
            except Exception:
                pass


@image_bp.route("/upscale", methods=["POST"])
def upscale_image_async():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    file_bytes = file.read()
    scale_factor = request.form.get("scale", 2, type=int)
    scale_factor = max(1, min(4, scale_factor))

    job_id = job_registry.create_job()
    job_registry.update(job_id, progress=0, status="processing",
                        message="Starting image upscale...")

    thread = threading.Thread(
        target=_process_upscale, args=(job_id, file_bytes, filename, scale_factor)
    )
    thread.daemon = True
    thread.start()

    return jsonify({"job_id": job_id}), 202


@image_bp.route("/convertJpeg", methods=["POST"])
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
def convert_to_grayscale():
    img = None
    grayscale_img = None
    try:
        if "image" not in request.files:
            return error("No image provided")

        file = request.files["image"]
        filename = secure_filename(file.filename)

        img = Image.open(file)

        try:
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
        finally:
            if grayscale_img:
                grayscale_img.close()
            if img:
                img.close()

    except Exception as e:
        return error(str(e), 500)


def _process_compress(job_id, file_bytes, filename, quality):
    img = None
    try:
        job_registry.update(job_id, progress=5, status="processing",
                            message="Opening image...")
        img = Image.open(BytesIO(file_bytes))

        job_registry.update(job_id, progress=20, status="processing",
                            message="Analyzing image format...")
        img_format = img.format if img.format in ["JPEG", "WEBP"] else "JPEG"
        if img_format == "JPEG" and img.mode != "RGB":
            img = img.convert("RGB")

        extension = ".jpg" if img_format == "JPEG" else ".webp"
        mimetype = "image/jpeg" if img_format == "JPEG" else "image/webp"

        job_registry.update(job_id, progress=50, status="processing",
                            message=f"Compressing at {quality}% quality...")

        buf = BytesIO()
        img.save(buf, format=img_format, quality=quality, optimize=True)
        buf.seek(0)
        data = buf.getvalue()

        job_registry.update(job_id, progress=80, status="processing",
                            message="Saving result...")

        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
            tmp.write(data)
            temp_path = tmp.name

        base = os.path.splitext(filename)[0]

        job_registry.update(
            job_id, progress=100, status="completed",
            message=f"Image compressed to {quality}% quality!",
            result_path=temp_path, result_mimetype=mimetype,
            download_name=f"{base}_compressed{extension}",
        )
    except Exception as e:
        job_registry.update(job_id, status="failed", message=str(e))
    finally:
        if img:
            try:
                img.close()
            except Exception:
                pass


@image_bp.route("/compress", methods=["POST"])
def compress_image_async():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    file_bytes = file.read()
    quality = request.form.get("quality", 70, type=int)
    quality = max(1, min(100, quality))

    job_id = job_registry.create_job()
    job_registry.update(job_id, progress=0, status="processing",
                        message="Starting image compression...")

    thread = threading.Thread(
        target=_process_compress, args=(job_id, file_bytes, filename, quality)
    )
    thread.daemon = True
    thread.start()

    return jsonify({"job_id": job_id}), 202


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
