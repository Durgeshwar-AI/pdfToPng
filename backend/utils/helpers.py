import gc
import os
import psutil
from flask import jsonify, after_this_request, send_file, make_response


def error(msg, code=400):
    return jsonify({"error": msg}), code


def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass


def log_memory(tag: str = ""):
    try:
        p = psutil.Process(os.getpid())
        rss = p.memory_info().rss / 1024.0 / 1024.0
        print(f"[MEM] {tag}: {rss:.2f} MB")
    except Exception:
        pass


def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file or bytes and ensures in-memory buffers are closed after the
    request finishes. Supports bytes, file-like objects, or filesystem paths.
    """
    try:
        from io import BytesIO

        # If raw bytes are passed, wrap in BytesIO and send directly.
        # Do NOT close the buffer in an after_this_request handler because
        # Werkzeug may still read from the buffer after that hook runs.
        # Rely on Python GC to reclaim the buffer once the response is sent.
        if isinstance(filename, (bytes, bytearray)):
            # Return a direct Response for raw bytes to avoid streaming
            # issues where the underlying file-like gets closed prematurely.
            resp = make_response(bytes(filename))
            mimetype = kwargs.get("mimetype") or kwargs.get("content_type") or "application/octet-stream"
            resp.headers["Content-Type"] = mimetype
            if kwargs.get("as_attachment"):
                download_name = kwargs.get("download_name", "file")
                resp.headers["Content-Disposition"] = f'attachment; filename="{download_name}"'
            # support caching directives
            if "max_age" in kwargs:
                resp.cache_control.max_age = int(kwargs.get("max_age") or 0)
            return resp

        # If a file-like object is passed, ensure it's at start and schedule close
        if hasattr(filename, "read"):
            try:
                filename.seek(0)
            except Exception:
                pass
            # Avoid closing here; let the WSGI server finish reading.
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
