import gc
import logging
import os
import re

from flask import after_this_request, jsonify, send_file
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


# A POSIX path segment: anything up to the next separator or whitespace.
_PATH_SEGMENT = r"[^\s/\\]+"

# Absolute POSIX paths of two segments or more: /etc/passwd, /app/config.env,
# /root/.ssh/id_rsa. Two segments is the shortest form worth redacting — a
# single segment such as "/health" is a route, not a filesystem location.
# The lookbehind keeps the scheme-relative part of a URL ("https://host/a/b")
# from being treated as a path.
_POSIX_PATH_RE = re.compile(rf"(?<![\w/\\])(?:/{_PATH_SEGMENT}){{2,}}/?")

# Home-relative paths: ~/.ssh/id_rsa, ~/config
_HOME_PATH_RE = re.compile(rf"~(?:/{_PATH_SEGMENT})+/?")

# Windows drive and UNC paths: C:\Users\..., D:/temp/..., \\server\share\...
# The lookbehind stops a URL scheme ("https://...") from looking like a drive.
_WINDOWS_PATH_RE = re.compile(rf"(?<![A-Za-z])[A-Za-z]:[\\/]\S*|\\\\{_PATH_SEGMENT}(?:[\\/]\S*)?")

# Temp directories get their own label so operators can still tell at a glance
# that a failure involved scratch space rather than an application path.
_TEMP_PATH_RE = re.compile(r"(?<![\w/\\])(?:/private)?/(?:var/)?tmp(?:/\S*)?")


def sanitize_error_message(message):
    """
    Sanitize error messages to remove sensitive file paths and system information.
    Prevents information disclosure of internal directory structures and temporary file locations.

    Third-party libraries embed filesystem paths in their exception text, and a
    crafted upload can steer which path ends up there (for example a PDF whose
    font reference points at /etc/passwd). Every path shape is stripped before
    the message is handed back to the client.
    """
    if not message or not isinstance(message, str):
        return "An error occurred"

    # Temp paths first, so they keep their more specific label instead of being
    # swallowed by the general POSIX rule below.
    message = _TEMP_PATH_RE.sub("**temp**", message)

    # Windows paths: C:\Users\..., \\server\share\...
    message = _WINDOWS_PATH_RE.sub("**file**", message)

    # Home-relative paths: ~/.ssh/id_rsa
    message = _HOME_PATH_RE.sub("**path**", message)

    # Absolute POSIX paths: /etc/passwd, /home/user/..., /var/...
    message = _POSIX_PATH_RE.sub("**path**", message)

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