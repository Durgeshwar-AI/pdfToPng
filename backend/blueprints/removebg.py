import io
import threading

import numpy as np
from flask import Blueprint, jsonify, request, Response
from PIL import Image, ImageFilter
from rembg import remove
from skimage import morphology

from utils.decorators import process_image_request
from utils.helpers import safe_gc_collect
from utils.job_manager import create_job, update_job, get_job, delete_job, cleanup_old_jobs

remove_bp = Blueprint("removebg", __name__)


def refine_alpha_mask(alpha, disk_radius=2, blur_radius=1.0):
    """
    Refine alpha mask using morphological operations and edge smoothing.

    1. Morphological opening removes stray pixels outside the subject
    2. Morphological closing fills small holes inside the subject
    3. Gaussian blur softens the edges for a more natural matte
    """
    mask = np.array(alpha)
    binary = mask > 128

    selem = morphology.disk(disk_radius)
    opened = morphology.binary_opening(binary, selem)
    cleaned = morphology.binary_closing(opened, selem)

    clean_mask = (cleaned * 255).astype(np.uint8)

    return Image.fromarray(clean_mask, mode="L").filter(
        ImageFilter.GaussianBlur(radius=blur_radius)
    )


def process_bg_removal(job_id, file_bytes):
    """
    Runs in a background thread. Updates job status/progress as it moves
    through each processing stage so the frontend can poll and display it.
    """
    try:
        update_job(job_id, status="processing", stage="loading_model", progress=10)

        # rembg's remove() loads the u2net model (cached after first run)
        # and runs inference internally — there's no sub-progress hook inside
        # this call itself, so we mark clear stage transitions around it.
        update_job(job_id, stage="removing_background", progress=30)
        output_bytes = remove(file_bytes)

        update_job(job_id, stage="refining_edges", progress=70)
        out_img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        alpha = out_img.split()[3]
        refined_alpha = refine_alpha_mask(alpha)
        out_img.putalpha(refined_alpha)

        update_job(job_id, stage="finalizing", progress=90)
        buf = io.BytesIO()
        out_img.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        data = buf.getvalue()

        out_img.close()
        del output_bytes
        safe_gc_collect()

        update_job(job_id, status="done", stage="complete", progress=100, result=data)

    except Exception as e:
        update_job(job_id, status="error", stage="error", error=str(e))


@remove_bp.route("/removeBg", methods=["POST"])
@process_image_request
def remove_bg(img, filename, file_bytes):
    # Opportunistically clean up old jobs on each new request so the
    # in-memory store doesn't grow unbounded over the app's lifetime.
    cleanup_old_jobs()

    # Validate image dimensions to prevent MemoryError on large images
    max_dimension = 4096  # Maximum 4K resolution
    max_megapixels = 10   # Maximum ~10 megapixels

    if img.width > max_dimension or img.height > max_dimension:
        return jsonify({
            "error": f"Image dimensions too large. Maximum supported: "
                     f"{max_dimension}x{max_dimension}px. Provided: {img.width}x{img.height}px"
        }), 413

    total_megapixels = (img.width * img.height) / (1024 * 1024)
    if total_megapixels > max_megapixels:
        return jsonify({
            "error": f"Image resolution too high. Maximum: {max_megapixels}MP. "
                     f"Provided: {total_megapixels:.1f}MP"
        }), 413

    job_id = create_job()

    thread = threading.Thread(
        target=process_bg_removal,
        args=(job_id, file_bytes),
        daemon=True,
    )
    thread.start()

    return jsonify({"job_id": job_id}), 202


@remove_bp.route("/removeBg/status/<job_id>", methods=["GET"])
def removebg_status(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    return jsonify({
        "status": job["status"],
        "stage": job["stage"],
        "progress": job["progress"],
        "error": job.get("error"),
    })


@remove_bp.route("/removeBg/result/<job_id>", methods=["GET"])
def removebg_result(job_id):
    job = get_job(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    if job["status"] == "error":
        return jsonify({"error": job.get("error") or "Processing failed"}), 500

    if job["status"] != "done":
        return jsonify({"error": "Job not finished yet"}), 409

    data = job["result"]
    filename = f"{job_id}_no_bg.png"

    # Deliver the file, then remove the job from memory since the result
    # has been consumed and no longer needs to be retained.
    response = Response(
        data,
        mimetype="image/png",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-store",
        },
    )
    delete_job(job_id)
    return response