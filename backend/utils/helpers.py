import os
import gc
from io import BytesIO
from flask import send_file, jsonify, after_this_request


def error(message, status_code=400):
    return jsonify({"error": message}), status_code


def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass


def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file and deletes it after the request is completed.
    Also forces garbage collection for large responses.
    """
    try:
        if isinstance(filename, (bytes, bytearray)):
            bio = BytesIO(filename)
            bio.seek(0)
            response = send_file(bio, **kwargs)
            safe_gc_collect()

            @after_this_request
            def cleanup_buffer(response):
                try:
                    bio.close()
                except Exception:
                    pass
                safe_gc_collect()
                return response

            return response

        if hasattr(filename, "read"):
            try:
                filename.seek(0)
            except Exception:
                pass
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response

        filepath = filename

        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception:
                pass
            safe_gc_collect()
            return response

        response = send_file(filepath, **kwargs)
        safe_gc_collect()
        return response

    except Exception:
        try:
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response
        except Exception:
            raise