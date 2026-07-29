import gc
import logging
import os
import tempfile
import uuid

from flask import after_this_request, jsonify, send_file, request
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

# Base directory for user-scoped temporary files
TEMP_BASE_DIR = os.environ.get("TEMP_DIR", tempfile.gettempdir())

# Per-IP concurrency limiter to prevent DoS via parallel uploads
MAX_CONCURRENT_PER_IP = int(os.environ.get("MAX_CONCURRENT_PER_IP", "3"))
_ip_concurrency_counter = {}


def get_client_ip():
    """Extract client IP from request, handling proxies safely."""
    # Get trusted proxy IP from environment
    if request.remote_addr == request.environ.get("HTTP_X_FORWARDED_FOR"):
        # Only trust X-Forwarded-For if it comes from a trusted proxy
        trusted_proxies = os.environ.get("TRUSTED_PROXIES", "").split(",")
        if request.environ.get("REMOTE_ADDR") in trusted_proxies:
            return request.environ.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()

    return request.remote_addr or "unknown"


def check_concurrency_limit():
    """
    Check and enforce per-IP concurrency limits to prevent DoS attacks.
    Returns True if within limit, False if limit exceeded.
    """
    client_ip = get_client_ip()

    # Increment counter for this IP
    _ip_concurrency_counter[client_ip] = _ip_concurrency_counter.get(client_ip, 0) + 1

    # Check if limit exceeded
    if _ip_concurrency_counter[client_ip] > MAX_CONCURRENT_PER_IP:
        _ip_concurrency_counter[client_ip] -= 1  # Rollback
        return False

    return True


def decrement_concurrency(client_ip=None):
    """Decrement concurrency counter after request completes."""
    if not client_ip:
        client_ip = get_client_ip()

    _ip_concurrency_counter[client_ip] = max(0, _ip_concurrency_counter.get(client_ip, 1) - 1)


def get_user_temp_dir(user_identifier=None):
    """
    Get a user-scoped temporary directory.
    Creates per-user isolation to prevent cross-user access to temporary files.

    Args:
        user_identifier: Optional user ID. If not provided, uses session/request ID

    Returns:
        Path to user-specific temporary directory
    """
    if not user_identifier:
        # Use session/request ID if available, otherwise generate unique ID
        user_identifier = getattr(request, "user_id", None) or str(uuid.uuid4())

    # Sanitize user identifier to prevent directory traversal
    safe_user_id = secure_filename(str(user_identifier))
    if not safe_user_id:
        safe_user_id = str(uuid.uuid4())

    user_temp_dir = os.path.join(TEMP_BASE_DIR, "pdfToPng_users", safe_user_id)

    # Create directory if it doesn't exist (with restrictive permissions)
    os.makedirs(user_temp_dir, mode=0o700, exist_ok=True)

    return user_temp_dir


def safe_gc_collect():
    """Safely trigger garbage collection and log failures."""
    try:
        gc.collect()
    except Exception:
        # Log the failure without affecting the response flow.
        logger.exception("Garbage collection failed.")


def sanitize_error_message(message):
    """
    Sanitize error messages to remove sensitive file paths and system information.
    Prevents information disclosure of internal directory structures.
    """
    if not message or not isinstance(message, str):
        return "An error occurred"

    # Remove common file path patterns (Unix and Windows)
    import re
    # Match absolute paths like /tmp/foo, /home/user/file, C:\Users\file
    message = re.sub(r"[A-Za-z]:[\\\/][^\s]*", "**file**", message)  # Windows
    message = re.sub(r"\/[^\s]*(?:\/[^\s]*){2,}", "**path**", message)  # Unix paths
    message = re.sub(r"\/tmp\/[^\s]*", "**temp**", message)  # Temp directory

    # Remove file extension patterns that might leak info
    message = re.sub(r"\.py\b|\.pyc\b", "**file**", message)

    # Limit message length to prevent large error responses
    if len(message) > 500:
        message = message[:497] + "..."

    return message


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