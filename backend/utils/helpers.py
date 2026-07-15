import os
from flask import send_file, after_this_request, jsonify
from werkzeug.utils import secure_filename
import gc
import atexit
import tempfile

def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass

def cleanup_orphaned_temp_files():
    """
    Emergency cleanup for orphaned temporary files that weren't cleaned up
    properly. Runs at application shutdown.
    """
    try:
        temp_dir = tempfile.gettempdir()
        if os.path.exists(temp_dir):
            import time
            now = time.time()
            # Remove files older than 2 hours to be conservative
            for f in os.listdir(temp_dir):
                try:
                    fpath = os.path.join(temp_dir, f)
                    if os.path.isfile(fpath) and os.stat(fpath).st_mtime < now - 7200:
                        os.remove(fpath)
                except Exception:
                    pass
    except Exception:
        pass

# Register emergency cleanup at application shutdown
atexit.register(cleanup_orphaned_temp_files)

def error(message, status_code=400):
    return jsonify({"success": False, "message": message}), status_code

def success(data=None, message="Success", status_code=200):
    return jsonify({"success": True, "message": message, "data": data}), status_code


def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file and deletes it after the request is completed.
    Also forces garbage collection for large responses.
    """
    # Defense in depth: sanitise download_name here, centrally, so every
    # caller is protected even if an upstream route forgets to sanitise the
    # original upload filename before deriving an output name from it.
    # secure_filename() strips path separators, ".." segments, and other
    # characters that could otherwise influence the Content-Disposition
    # header returned to the client.
    if kwargs.get("download_name"):
        kwargs["download_name"] = secure_filename(kwargs["download_name"]) or "download"

    # Support bytes or file-like objects to avoid touching disk
    try:
        from io import BytesIO

        # If raw bytes are passed, wrap in BytesIO and send directly
        if isinstance(filename, (bytes, bytearray)):
            bio = BytesIO(filename)
            bio.seek(0)
            response = send_file(bio, **kwargs)
            
            # Force garbage collection after response
            safe_gc_collect()
            
            # Close the buffer after response
            @after_this_request
            def cleanup_buffer(response):
                try:
                    bio.close()
                except Exception:
                    pass
                safe_gc_collect()
                return response
            
            return response

        # If a file-like object is passed, ensure it's at start and send
        if hasattr(filename, "read"):
            try:
                filename.seek(0)
            except Exception:
                pass
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response

        # Otherwise treat as a filesystem path and schedule cleanup
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
        # Fallback: attempt to send as path
        try:
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response
        except Exception:
            raise
