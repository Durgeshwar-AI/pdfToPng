import io

from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename

from utils.helpers import error

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}


def validate_uploaded_file(request, field_name):
    if field_name not in request.files:
        return None, None, error("No file provided", 400)

    file = request.files[field_name]

    if not file or file.filename == "":
        return None, None, error("No file selected", 400)

    filename = secure_filename(file.filename)

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


def validate_image_file(file):
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


def validate_pdf_file(filename):
    return validate_file_extension(
        filename,
        ALLOWED_PDF_EXTENSIONS,
        "Invalid file format. Please upload a PDF file.",
    )
