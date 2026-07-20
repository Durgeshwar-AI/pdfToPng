import gc
import logging
import os

from flask import after_this_request, jsonify, send_file
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


def safe_gc_collect():
    """Safely trigger garbage collection and log failures."""
    try:
        gc.collect()
    except Exception:
        # Log the failure without affecting the response flow.
        logger.exception("Garbage collection failed.")


def error(message, status_code=400):
    return jsonify({"success": False, "message": message}), status_code


def success(data=None, message="Success", status_code=200):
    return jsonify(
        {
            "success": True,
            "message": message,
            "data": data,
        }
    ), status_code


def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file and deletes it after the request is completed.
    Also forces garbage collection for large responses.
    """

    # Sanitize download filename to prevent path traversal in
    # Content-Disposition headers.
    if kwargs.get("download_name"):
        kwargs["download_name"] = (
            secure_filename(kwargs["download_name"]) or "download"
        )

    try:
        from io import BytesIO

        # Handle raw bytes/bytearray without writing to disk.
        if isinstance(filename, (bytes, bytearray)):
            bio = BytesIO(filename)
            bio.seek(0)

            response = send_file(bio, **kwargs)
            safe_gc_collect()

            @after_this_request
            def cleanup_buffer(response):
                """Close in-memory buffer after the response."""
                try:
                    bio.close()
                except Exception:
                    # Log cleanup failures without interrupting the response.
                    logger.exception("Failed to close in-memory buffer.")

                safe_gc_collect()
                return response

            return response

        # Handle file-like objects.
        if hasattr(filename, "read"):
            try:
                filename.seek(0)
            except Exception:
                logger.warning(
                    "Unable to seek file-like object before sending."
                )

            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response

        # Handle filesystem paths.
        filepath = filename

        @after_this_request
        def cleanup(response):
            """Delete temporary file after sending."""
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception:
                # Preserve existing behaviour while recording the failure.
                logger.exception(
                    "Failed to delete temporary file: %s",
                    filepath,
                )

            safe_gc_collect()
            return response

        response = send_file(filepath, **kwargs)
        safe_gc_collect()
        return response

    except Exception:
        # Log the original failure but preserve the existing fallback
        # behaviour by attempting to send the file as a normal path.
        logger.exception("Failed during send_file_and_cleanup.")

        try:
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response
        except Exception:
            logger.exception("Fallback send_file also failed.")
            raise