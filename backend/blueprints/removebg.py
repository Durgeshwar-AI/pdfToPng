import io
import numpy as np
from flask import Blueprint
from PIL import Image, ImageFilter
from rembg import remove
from skimage import morphology

from utils.helpers import error, safe_gc_collect, send_file_and_cleanup, log_memory
from werkzeug.utils import secure_filename

remove_bp = Blueprint("removebg", __name__)


@remove_bp.route("/removeBg", methods=["POST"])
def remove_bg():
    try:
        file = request.files.get("image")

    cleaned = morphology.binary_closing(opened, selem)

    clean_mask = (cleaned * 255).astype(np.uint8)

        log_memory("removeBg - before read")

        # Read uploaded file bytes into memory
        input_bytes = file.read()

        log_memory("removeBg - after read")

        output_bytes = remove(input_bytes)

        # Clean up input bytes reference promptly
        del input_bytes
        safe_gc_collect()
        log_memory("removeBg - after remove and gc")

        # Use context managers for PIL and BytesIO to ensure cleanup
        from io import BytesIO

        with Image.open(BytesIO(output_bytes)) as img:
            with BytesIO() as buf:
                img.save(buf, format="PNG", optimize=True)
                buf.seek(0)
                data = buf.getvalue()

        # Free output bytes and collect
        try:
            del output_bytes
        except Exception:
            pass
        safe_gc_collect()
        log_memory("removeBg - before return")

    return send_file_and_cleanup(
        data,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"{base}_no_bg.png",
        max_age=0,
    )
