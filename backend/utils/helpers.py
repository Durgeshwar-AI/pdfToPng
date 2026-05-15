import gc
import os
from flask import jsonify, after_this_request, send_file


def error(msg, code=400):
    return jsonify({"error": msg}), code


def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass


def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file and deletes it after the request is completed.
    """
    # Support bytes or file-like objects to avoid touching disk
    try:
        # Lazy import to avoid unused import when not needed
        from io import BytesIO

        # If raw bytes are passed, wrap in BytesIO and send directly
        if isinstance(filename, (bytes, bytearray)):
            bio = BytesIO(filename)
            bio.seek(0)
            return send_file(bio, **kwargs)

        # If a file-like object is passed, ensure it's at start and send
        if hasattr(filename, "read"):
            try:
                filename.seek(0)
            except Exception:
                pass
            return send_file(filename, **kwargs)

        # Otherwise treat as a filesystem path and schedule cleanup
        filepath = filename

        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception:
                pass
            return response

        return send_file(filepath, **kwargs)
    except Exception:
        # Fallback: attempt to send as path
        try:
            return send_file(filename, **kwargs)
        except Exception:
            raise
