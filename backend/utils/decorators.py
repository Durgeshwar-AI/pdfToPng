import functools
import io
import traceback
from flask import request
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename
from utils.helpers import error, safe_gc_collect

def process_image_request(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if "image" not in request.files:
            return error("No image provided", 400)

        file = request.files["image"]
        if not file or file.filename == "":
            return error("No file selected", 400)

        filename = secure_filename(file.filename)
        img = None
        try:
            file_bytes = file.read()
            img = Image.open(io.BytesIO(file_bytes))
            # Execute the actual route function, passing img, filename, and file_bytes
            return f(img, filename, file_bytes, *args, **kwargs)
        except (ValueError, UnidentifiedImageError) as e:
            return error(str(e), 400)
        except Exception as e:
            traceback.print_exc()
            return error(str(e), 500)
        finally:
            if img:
                try:
                    img.close()
                except Exception:
                    pass
            safe_gc_collect()
    return decorated_function
