import io
import os
from pathlib import Path

from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename

from utils.helpers import error

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}
ALLOWED_IMAGE_MIME_TYPES = {"image/png", "image/jpeg", "image/webp"}
ALLOWED_PDF_MIME_TYPES = {"application/pdf"}

# Upload directory for temporary file storage (if needed in future)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")

def validate_path_safety(filename, base_directory=None):
    """
    Validate that a filename doesn't contain path traversal sequences.
    Ensures the resolved path stays within the intended directory.

    Prevents attacks like:
    - ../../etc/passwd
    - ../../app/config.js
    - ..\\..\config.env
    """
    if not base_directory:
        base_directory = UPLOAD_DIR

    # Ensure the filename doesn't contain null bytes
    if '\0' in filename:
        return error("Invalid filename: contains null bytes", 400)

    # Ensure no path separators in filename
    if '/' in filename or '\\' in filename:
        return error("Invalid filename: contains path separators", 400)

    # Ensure no parent directory references
    if '..' in filename:
        return error("Invalid filename: contains parent directory references", 400)

    # Additional safety: resolve the full path and verify it's within base_directory
    try:
        base_path = Path(base_directory).resolve()
        full_path = (base_path / filename).resolve()

        # Ensure the resolved path is within base_directory
        if not str(full_path).startswith(str(base_path)):
            return error("Invalid filename: resolves outside upload directory", 400)
    except (ValueError, RuntimeError):
        return error("Invalid filename: path validation failed", 400)

    return None

def validate_uploaded_file(request, field_name):
    if field_name not in request.files:
        return None, None, error("No file provided", 400)

    file = request.files[field_name]

    if not file or file.filename == "":
        return None, None, error("No file selected", 400)

    filename = secure_filename(file.filename)

    # **CRITICAL:** Path traversal prevention
    path_error = validate_path_safety(filename)
    if path_error:
        return None, None, path_error

    return file, filename, None


def validate_file_extension(
    filename,
    allowed_extensions,
    message,
):
    parts = filename.rsplit(".", 1)
    extension = f".{parts[1].lower()}" if len(parts) == 2 else ""

    if extension not in allowed_extensions:
        return error(message, 400)

    return None

def validate_mime_type(
    file,
    allowed_types,
    message,
):
    if file.mimetype not in allowed_types:
        return error(message, 400)

    return None

def validate_image_file(file):
    mime_error = validate_mime_type(
        file,
        ALLOWED_IMAGE_MIME_TYPES,
        "Invalid image MIME type.",
    )

    if mime_error:
        return None, None, mime_error

    try:
        file_bytes = file.read()
        img = Image.open(io.BytesIO(file_bytes))
        img.load()

        return img, file_bytes, None

    except (UnidentifiedImageError, OSError):
        return None, None, error(
            "Invalid or corrupted image file provided",
            400,
        )

def validate_pdf_file(
    file,
    filename,
):
    extension_error = validate_file_extension(
        filename,
        ALLOWED_PDF_EXTENSIONS, "Invalid file format. Please upload a PDF file.")

    if extension_error:
        return extension_error

    mime_error = validate_mime_type(file, ALLOWED_PDF_MIME_TYPES, "Invalid PDF MIME type.")

    if mime_error:
        return mime_error

    return None
