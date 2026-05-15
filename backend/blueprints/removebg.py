import io
import traceback

from flask import Blueprint, request
from PIL import Image
from rembg import remove

from utils.helpers import error, safe_gc_collect, send_file_and_cleanup
from werkzeug.utils import secure_filename

remove_bp = Blueprint("removebg", __name__)


@remove_bp.route("/removeBg", methods=["POST"])
def remove_bg():
    img = None
    try:
        file = request.files.get("image")

        if not file or file.filename == "":
            return error("No image provided", 400)

        filename = secure_filename(file.filename)
        base = filename.rsplit('.', 1)[0]

        # Read uploaded file bytes into memory
        input_bytes = file.read()

        output_bytes = remove(input_bytes)

        # Clean up input bytes reference
        del input_bytes
        safe_gc_collect()

        img = Image.open(io.BytesIO(output_bytes))

        # Save processed image to memory buffer
        buf = io.BytesIO()
        try:
            img.save(buf, format="PNG", optimize=True)
            buf.seek(0)
            data = buf.getvalue()
        finally:
            if img:
                img.close()
                img = None

        # Free output bytes
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
    except Exception as e:
        safe_gc_collect()
        traceback.print_exc()
        return error(f"Background removal failed: {str(e)}", 500)
