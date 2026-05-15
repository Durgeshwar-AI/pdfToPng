import io
import os
import tempfile
import traceback

from flask import Blueprint, request
from PIL import Image
from rembg import remove

from utils.helpers import error, safe_gc_collect, send_file_and_cleanup
from werkzeug.utils import secure_filename

remove_bp = Blueprint("removebg", __name__)


@remove_bp.route("/removeBg", methods=["POST"])
def remove_bg():
    temp_input_path = None
    temp_output_path = None
    img = None
    try:
        file = request.files.get("image")

        if not file or file.filename == "":
            return error("No image provided", 400)

        filename = secure_filename(file.filename)
        base = filename.rsplit('.', 1)[0]

        # Get a temporary file path
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{filename}") as temp_input:
            temp_input_path = temp_input.name
        
        # Save the uploaded file to the temporary path (now that the file is closed)
        file.save(temp_input_path)

        try:
            # Read bytes from temp file for rembg
            with open(temp_input_path, 'rb') as f:
                input_bytes = f.read()

            output_bytes = remove(input_bytes)
            
            # Clean up input bytes immediately
            del input_bytes
            safe_gc_collect()

            img = Image.open(io.BytesIO(output_bytes))
            
            # Free output bytes once image is opened
            del output_bytes
            safe_gc_collect()

            try:
                # Get a temporary path for the output
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_output:
                    temp_output_path = temp_output.name
                
                # Save the processed image
                img.save(temp_output_path, format="PNG", optimize=True)
            finally:
                if img:
                    img.close()
                    img = None

            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)

            return send_file_and_cleanup(
                temp_output_path,
                mimetype="image/png",
                as_attachment=True,
                download_name=f"{base}_no_bg.png",
                max_age=0,
            )
        except Exception as e:
            # Re-raise to be caught by the outer except block for cleanup
            raise e
    except Exception as e:
        if temp_input_path and os.path.exists(temp_input_path):
            try:
                os.remove(temp_input_path)
            except Exception:
                pass
        if temp_output_path and os.path.exists(temp_output_path):
            try:
                os.remove(temp_output_path)
            except Exception:
                pass
        
        safe_gc_collect()
        traceback.print_exc()
        return error(f"Background removal failed: {str(e)}", 500)
