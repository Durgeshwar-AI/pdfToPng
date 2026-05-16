import io
import traceback

from flask import Blueprint, request
from PIL import Image
from rembg import remove

from utils.file_handling import temp_upload_file
from utils.helpers import error, safe_gc_collect, send_file_and_cleanup
from werkzeug.utils import secure_filename

remove_bp = Blueprint("removebg", __name__)


@remove_bp.route("/removeBg", methods=["POST"])
def remove_bg():
    try:
        file = request.files.get("image")

        if not file or file.filename == "":
            return error("No image provided", 400)

        filename = secure_filename(file.filename)
        base = filename.rsplit('.', 1)[0]

        with temp_upload_file(file) as temp_path:
            with Image.open(temp_path) as img:
                # rembg.remove can take a PIL Image and returns a PIL Image
                output_img = remove(img)

            out = io.BytesIO()
            output_img.save(out, format="PNG", optimize=True)
            data = out.getvalue()
            
            output_img.close()

        safe_gc_collect()

        return send_file_and_cleanup(
            data,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}_no_bg.png",
            max_age=0,
        )
    except Exception as e:
        safe_gc_collect()
        traceback.print_exc()
        return error(f"Background removal failed: {str(e)}", 500)
