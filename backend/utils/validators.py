import io
import os
from pathlib import Path

from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename

from utils.helpers import error

# Set strict image size limit to prevent decompression bomb attacks
# Default Pillow limit is ~89.5 Mpx; we use 40 Mpx as a safer threshold
Image.MAX_IMAGE_PIXELS = 40_000_000

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}
ALLOWED_IMAGE_MIME_TYPES = {"image/png", "image/jpeg", "image/webp"}
ALLOWED_PDF_MIME_TYPES = {"application/pdf"}

# Base name used when Markdown arrives as pasted text instead of an uploaded
# file, so the generated download still gets a sensible filename.
DEFAULT_MARKDOWN_BASENAME = "document"

# Upload directory for temporary file storage (if needed in future)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")

def validate_path_safety(filename, base_directory=None):
    r"""
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


def resolve_markdown_input(request, file_field="file", text_field="text"):
    """
    Resolve Markdown content from either an uploaded .md file or pasted text.

    Returns (md_content, base_name, error_response), where `base_name` is the
    download name without its extension. On failure the first two values are
    None and an error response is returned instead.
    """
    md_file = request.files.get(file_field)

    if md_file is not None and md_file.filename != "":
        if not md_file.filename.lower().endswith(".md"):
            return None, None, error(
                "Invalid file format. Please upload a Markdown (.md) file."
            )

        try:
            md_content = md_file.read().decode("utf-8")
        except UnicodeDecodeError:
            return None, None, error(
                "Could not decode the file as UTF-8. "
                "Please ensure it is a valid Markdown file."
            )

        base_name = md_file.filename.rsplit(".", 1)[0] or DEFAULT_MARKDOWN_BASENAME
        return md_content, base_name, None

    md_text = request.form.get(text_field, "")

    if md_text.strip() == "":
        return None, None, error(
            "No Markdown provided. Please upload a .md file or enter Markdown text."
        )

    return md_text, DEFAULT_MARKDOWN_BASENAME, None


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

    except Image.DecompressionBombError:
        return None, None, error(
            "Image resolution exceeds maximum allowed size (40 megapixels). "
            "Please use a smaller image.",
            413,
        )

    except (UnidentifiedImageError, OSError):
        return None, None, error(
            "Invalid or corrupted image file provided",
            400,
        )

def validate_pdf_magic_bytes(file_bytes):
    """
    Validate PDF file by checking magic bytes (file signature).
    PDF files must start with %PDF signature to be legitimate.
    This prevents attackers from uploading non-PDF files renamed with .pdf extension.

    Magic bytes: %PDF (0x25 0x50 0x44 0x46)
    """
    if len(file_bytes) < 4:
        return error("File is too small to be a valid PDF", 400)

    # Check for PDF magic bytes at the start
    pdf_signature = b'%PDF'
    if not file_bytes.startswith(pdf_signature):
        return error(
            "Invalid PDF file. File does not have valid PDF signature. "
            "Please upload a legitimate PDF file.",
            400
        )

    return None

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

    # **CRITICAL:** Server-side magic byte validation
    # Do not rely on file extension or client-provided MIME type (both attacker-controlled)
    # Check actual file signature to ensure legitimacy
    file_bytes = file.read()
    file.seek(0)  # Reset file pointer for downstream processing

    magic_error = validate_pdf_magic_bytes(file_bytes)
    if magic_error:
        return magic_error

    return None
