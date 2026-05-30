import io
import tempfile
import threading
import numpy as np
from flask import Blueprint, request, jsonify
from PIL import Image, ImageFilter
from rembg import remove
from skimage import morphology
from werkzeug.utils import secure_filename

from utils.helpers import safe_gc_collect
from utils.job_registry import job_registry

remove_bp = Blueprint("removebg", __name__)


def refine_alpha_mask(alpha, disk_radius=2, blur_radius=1.0):
    mask = np.array(alpha)
    binary = mask > 128
    selem = morphology.disk(disk_radius)
    opened = morphology.binary_opening(binary, selem)
    cleaned = morphology.binary_closing(opened, selem)
    clean_mask = (cleaned * 255).astype(np.uint8)
    result = Image.fromarray(clean_mask, mode="L").filter(
        ImageFilter.GaussianBlur(radius=blur_radius)
    )
    return result


def _process_removebg(job_id, file_bytes, filename):
    base = filename.rsplit(".", 1)[0]
    out_img = None
    temp_path = None
    try:
        job_registry.update(job_id, progress=5, status="processing",
                            message="Loading AI model and processing image...")

        output_bytes = remove(file_bytes)

        job_registry.update(job_id, progress=60, status="processing",
                            message="Refining alpha mask and edges...")

        out_img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        alpha = out_img.split()[3]
        refined_alpha = refine_alpha_mask(alpha)
        out_img.putalpha(refined_alpha)

        job_registry.update(job_id, progress=85, status="processing",
                            message="Saving result...")

        buf = io.BytesIO()
        out_img.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        data = buf.getvalue()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(data)
            temp_path = tmp.name

        job_registry.update(
            job_id, progress=100, status="completed",
            message="Background removed successfully!",
            result_path=temp_path, result_mimetype="image/png",
            download_name=f"{base}_no_bg.png",
        )
    except Exception as e:
        job_registry.update(job_id, status="failed", message=str(e))
    finally:
        if out_img:
            try:
                out_img.close()
            except Exception:
                pass
        try:
            safe_gc_collect()
        except Exception:
            pass


@remove_bp.route("/removeBg", methods=["POST"])
def remove_bg_async():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    file_bytes = file.read()

    job_id = job_registry.create_job()
    job_registry.update(job_id, progress=0, status="processing",
                        message="Starting background removal...")

    thread = threading.Thread(
        target=_process_removebg, args=(job_id, file_bytes, filename)
    )
    thread.daemon = True
    thread.start()

    return jsonify({"job_id": job_id}), 202
