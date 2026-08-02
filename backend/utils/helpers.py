import gc
import logging
import os
import re

from flask import after_this_request, jsonify, send_file
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


def sanitize_error_message(message):
    """
    Sanitize error messages to remove sensitive file paths and system information.
    Prevents information disclosure of internal directory structures and temporary file locations.
    """
    if not message or not isinstance(message, str):
        return "An error occurred"

    # Remove file path patterns that could leak internal directory structures
    # Windows paths: C:\Users\..., D:\temp\...
    message = re.sub(r"[A-Za-z]:[\\\/][^\s]*", "**file**", message)
    # Unix absolute paths: /home/user/..., /var/...
    message = re.sub(r"\/[^\s]*(?:\/[^\s]*){2,}", "**path**", message)
    # Temp directory paths: /tmp/..., /var/tmp/...
    message = re.sub(r"\/tmp\/[^\s]*|\/var\/tmp\/[^\s]*", "**temp**", message)

    # Remove Python file extension patterns that might leak implementation details
    message = re.sub(r"\.py\b|\.pyc\b|\.pyx\b", "**file**", message)

    # Limit message length to prevent large error responses (DoS via error messages)
    if len(message) > 500:
        message = message[:497] + "..."

    return message


def safe_gc_collect():
    """Safely trigger garbage collection and log failures."""
    try:
        gc.collect()
    except Exception:
        # Log the failure without affecting the response flow.
        logger.exception("Garbage collection failed.")


def error(message, status_code=400):
    """Return error response with sanitized message to prevent information disclosure."""
    sanitized_message = sanitize_error_message(message)
    return jsonify({"success": False, "message": sanitized_message}), status_code


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