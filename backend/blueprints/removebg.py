import io
import numpy as np
from flask import Blueprint
from PIL import Image, ImageFilter
from rembg import remove
from skimage import morphology

from utils.decorators import process_image_request
from utils.helpers import safe_gc_collect, send_file_and_cleanup

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

    result = Image.fromarray(clean_mask, mode="L").filter(
        ImageFilter.GaussianBlur(radius=blur_radius)
    )

    return result


@remove_bp.route("/removeBg", methods=["POST"])
@process_image_request
def remove_bg(img, filename, file_bytes):
    base = filename.rsplit('.', 1)[0]

    # Validate image dimensions to prevent MemoryError on large images
    # rembg requires significant memory for processing, especially with high-res images
    max_dimension = 4096  # Maximum 4K resolution
    max_megapixels = 10   # Maximum 50 megapixels (e.g., 7071x7071)

    if img.width > max_dimension or img.height > max_dimension:
        from flask import jsonify
        return jsonify({
            "error": f"Image dimensions too large. Maximum supported: {max_dimension}x{max_dimension}px. "
                   f"Provided: {img.width}x{img.height}px"
        }), 413

    total_megapixels = (img.width * img.height) / (1024 * 1024)
    if total_megapixels > max_megapixels:
        from flask import jsonify
        return jsonify({
            "error": f"Image resolution too high. Maximum: {max_megapixels}MP. "
                   f"Provided: {total_megapixels:.1f}MP"
        }), 413

    # Run background removal using the uploaded file bytes
    output_bytes = remove(file_bytes)

    out_img = None
    try:
        out_img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

        # Refine alpha mask for smoother edges and better matting
        alpha = out_img.split()[3]
        refined_alpha = refine_alpha_mask(alpha)
        out_img.putalpha(refined_alpha)

        # Save processed image to memory buffer
        buf = io.BytesIO()
        out_img.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        data = buf.getvalue()
    finally:
        if out_img:
            try:
                out_img.close()
            except Exception:
                pass
            out_img = None

        try:
            del output_bytes
            safe_gc_collect()
        except Exception:
            pass

    return send_file_and_cleanup(
        data,
        mimetype="image/png",
        as_attachment=True,
        download_name=f"{base}_no_bg.png",
        max_age=0,
    )
