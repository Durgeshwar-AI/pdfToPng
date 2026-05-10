import io

from flask import Blueprint, request, send_file
from PIL import Image
from rembg import remove

from utils.helpers import error, safe_gc_collect
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

        input_bytes = file.read()

        output_bytes = remove(input_bytes)

        img = Image.open(io.BytesIO(output_bytes))

        out = io.BytesIO()
        img.save(out, format="PNG", optimize=True)
        out.seek(0)

        try:
            img.close()
        except Exception:
            pass

        safe_gc_collect()

        return send_file(
            out,
            mimetype="image/png",
            as_attachment=True,
            download_name=f"{base}_no_bg.png",
            max_age=0,
        )

    except Exception as e:
        safe_gc_collect()
        return error(f"Background removal failed: {str(e)}", 500)
