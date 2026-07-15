import functools
import traceback
import os
import tempfile

from flask import request, after_this_request

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
        temp_files = []

        try:
            img, file_bytes, image_error = validate_image_file(file)

            if image_error:
                return image_error

            # Register cleanup for temporary files created by this request
            @after_this_request
            def cleanup_temp_files(response):
                for temp_file in temp_files:
                    if temp_file and os.path.exists(temp_file):
                        try:
                            os.remove(temp_file)
                        except Exception:
                            pass
                # Clean up Python's temp directory on rare occasions
                try:
                    temp_dir = tempfile.gettempdir()
                    if os.path.exists(temp_dir):
                        # Only remove files older than 1 hour to avoid conflicts
                        import time
                        now = time.time()
                        for f in os.listdir(temp_dir):
                            fpath = os.path.join(temp_dir, f)
                            if os.path.isfile(fpath):
                                if os.stat(fpath).st_mtime < now - 3600:
                                    try:
                                        os.remove(fpath)
                                    except Exception:
                                        pass
                except Exception:
                    pass
                return response

            return f(img, filename, file_bytes, *args, temp_files=temp_files, **kwargs)

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

            # Immediate cleanup of tracked temp files on exception
            for temp_file in temp_files:
                if temp_file and os.path.exists(temp_file):
                    try:
                        os.remove(temp_file)
                    except Exception:
                        pass

            safe_gc_collect()

    return decorated_function
