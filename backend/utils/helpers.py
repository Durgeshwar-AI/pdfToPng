import gc
import logging
import os

from flask import after_this_request, jsonify, send_file
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass

def error(message, status_code=400):
    return jsonify({"success": False, "message": message}), status_code

def success(data=None, message="Success", status_code=200):
    return jsonify({"success": True, "message": message, "data": data}), status_code


from io import BytesIO


def _handle_bytes_response(data, **kwargs):
    """Handle bytes and bytearray responses."""
    bio = BytesIO(data)
    bio.seek(0)

    response = send_file(bio, **kwargs)
    safe_gc_collect()

    @after_this_request
    def cleanup_buffer(response):
        try:
            bio.close()
        except Exception:
            logger.exception("Failed to close in-memory buffer.")

        safe_gc_collect()
        return response

    return response


def _handle_file_object_response(file_obj, **kwargs):
    """Handle file-like objects."""
    try:
        file_obj.seek(0)
    except Exception:
        logger.warning("Unable to seek file-like object before sending.")

    response = send_file(file_obj, **kwargs)
    safe_gc_collect()
    return response


def _handle_file_path_response(filepath, **kwargs):
    """Handle filesystem paths."""

    @after_this_request
    def cleanup(response):
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            logger.exception(
                "Failed to delete temporary file: %s",
                filepath,
            )

        safe_gc_collect()
        return response

    response = send_file(filepath, **kwargs)
    safe_gc_collect()
    return response


def send_file_and_cleanup(filename, **kwargs):
    """
    Send a file response and perform cleanup after the request.

    Supports:
    - filesystem paths
    - bytes / bytearray
    - file-like objects

    Existing API behaviour is preserved.
    """

    if kwargs.get("download_name"):
        kwargs["download_name"] = (
            secure_filename(kwargs["download_name"]) or "download"
        )

    try:
        if isinstance(filename, (bytes, bytearray)):
            return _handle_bytes_response(filename, **kwargs)

        if hasattr(filename, "read"):
            return _handle_file_object_response(filename, **kwargs)

        return _handle_file_path_response(filename, **kwargs)

    except Exception:
        logger.exception("Failed during send_file_and_cleanup().")

        try:
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response
        except Exception:
            logger.exception("Fallback send_file() also failed.")
            raise