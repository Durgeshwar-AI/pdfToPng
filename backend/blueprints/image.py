import io
import os
import tempfile

from flask import Blueprint, request, send_file
from PIL import Image, ImageEnhance

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
