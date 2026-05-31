import functools
import traceback

from flask import request

from utils.helpers import error, safe_gc_collect
from utils.validators import (
    validate_image_file,
    validate_uploaded_file,
)


def process_image_request(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        file, filename, upload_error = validate_uploaded_file(
            request,
            "image",
        )

        if upload_error:
            return upload_error

        img = None

        try:
            img, file_bytes, image_error = validate_image_file(file)

            if image_error:
                return image_error

            return f(img, filename, file_bytes, *args, **kwargs)

        except ValueError as e:
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
