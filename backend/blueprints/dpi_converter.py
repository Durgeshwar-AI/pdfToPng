import os
from flask import Blueprint, request, jsonify
from PIL import Image, ImageFile
from werkzeug.utils import secure_filename
from utils.helpers import error, send_file_and_cleanup, success
import piexif
import io
import zipfile

# Prevent decompression bomb attacks
MAX_PIXELS = int(os.getenv("MAX_IMAGE_PIXELS", "50000000"))
Image.MAX_IMAGE_PIXELS = MAX_PIXELS

# Allow partially corrupted images
ImageFile.LOAD_TRUNCATED_IMAGES = True

dpi_bp = Blueprint("dpi_converter", __name__)

# Supported formats
ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "tiff",
    "tif",
    "bmp",
}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def get_safe_dpi(img):

    dpi = img.info.get("dpi", (72, 72))

    try:

        dpi_x = dpi[0]

        # TIFF sometimes returns rational tuples
        if isinstance(dpi_x, tuple):
            dpi_x = dpi_x[0] / dpi_x[1]

        dpi_x = float(dpi_x)

        if dpi_x <= 0:
            dpi_x = 72

    except Exception:
        dpi_x = 72

    return dpi_x, dpi


def normalize_image_mode(img):

    try:

        # Multi-frame TIFF safety
        if getattr(img, "is_animated", False):
            img.seek(0)

        # Palette images
        if img.mode == "P":
            img = img.convert("RGBA")

        # Unsupported modes
        elif img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

    except Exception:
        pass

    return img


def set_dpi(img, target_dpi, resample):

    img = normalize_image_mode(img)

    dpi_x, original_dpi = get_safe_dpi(img)

    original_size = img.size

    if resample and dpi_x > 0:

        scale = target_dpi / dpi_x

        new_size = (
            max(1, int(original_size[0] * scale)),
            max(1, int(original_size[1] * scale)),
        )

        img = img.resize(new_size, Image.LANCZOS)

    return img, {
        "original_dpi": (
            list(original_dpi)
            if isinstance(original_dpi, tuple)
            else [72, 72]
        ),
        "new_dpi": [target_dpi, target_dpi],
        "original_size_px": list(original_size),
        "new_size_px": list(img.size),
        "resampled": resample,
    }


def save_with_dpi(img, ext, target_dpi):

    buf = io.BytesIO()

    ext = ext.lower()

    # JPEG
    if ext in ("jpg", "jpeg"):

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        exif_bytes = None

        try:

            exif_dict = (
                piexif.load(img.info["exif"])
                if "exif" in img.info
                else {
                    "0th": {},
                    "Exif": {},
                    "GPS": {},
                    "1st": {},
                }
            )

            exif_dict["0th"][piexif.ImageIFD.XResolution] = (
                target_dpi,
                1,
            )

            exif_dict["0th"][piexif.ImageIFD.YResolution] = (
                target_dpi,
                1,
            )

            exif_dict["0th"][piexif.ImageIFD.ResolutionUnit] = 2

            exif_bytes = piexif.dump(exif_dict)

        except Exception:
            pass

        kwargs = {
            "format": "JPEG",
            "dpi": (target_dpi, target_dpi),
            "quality": 95,
            "subsampling": 0,
        }

        if exif_bytes:
            kwargs["exif"] = exif_bytes

        img.save(buf, **kwargs)

    # PNG
    elif ext == "png":

        img.save(
            buf,
            format="PNG",
            dpi=(target_dpi, target_dpi),
        )

    # TIFF
    elif ext in ("tiff", "tif"):

        img.save(
            buf,
            format="TIFF",
            dpi=(target_dpi, target_dpi),
            compression="tiff_lzw",
        )

    # BMP
    elif ext == "bmp":

        img.save(
            buf,
            format="BMP",
            dpi=(target_dpi, target_dpi),
        )

    else:
        raise ValueError("Unsupported image format")

    buf.seek(0)

    return buf


@dpi_bp.route("/convert-dpi", methods=["POST"])
def convert_dpi():

    files = request.files.getlist("images")

    target_dpi = request.form.get("dpi", 300, type=int)

    resample = (
        request.form.get("resample", "false").lower() == "true"
    )

    if not files or all(f.filename == "" for f in files):
        return error("No files provided")

    if target_dpi <= 0 or target_dpi > 2400:
        return error("DPI must be between 1 and 2400")

    converted = []

    for file in files:

        if not file.filename or not allowed_file(file.filename):

            return error(
                f"Unsupported file format: {file.filename}"
            )

        try:

            ext = file.filename.rsplit(".", 1)[1].lower()

            img = Image.open(file.stream)

            img.load()

            # Image size protection
            if img.size[0] * img.size[1] > MAX_PIXELS:
                raise ValueError("Image too large")

            img, _ = set_dpi(
                img,
                target_dpi,
                resample,
            )

            buf = save_with_dpi(
                img,
                ext,
                target_dpi,
            )

            stem = secure_filename(
                file.filename.rsplit(".", 1)[0]
            )

            out_name = f"{stem}_{target_dpi}dpi.{ext}"

            converted.append(
                (
                    out_name,
                    buf.read(),
                )
            )

        except Exception as e:

            return error(
                f"Failed to process {file.filename}: {str(e)}"
            )

    if not converted:
        return error("No valid image files found")

    # Single file
    if len(converted) == 1:

        name, data = converted[0]

        ext = name.rsplit(".", 1)[1].lower()

        MIME_TYPES = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "tiff": "image/tiff",
            "tif": "image/tiff",
            "bmp": "image/bmp",
        }

        return send_file_and_cleanup(
            data,
            mimetype=MIME_TYPES.get(
                ext,
                "application/octet-stream",
            ),
            as_attachment=True,
            download_name=name,
        )

    # Multiple files -> ZIP
    zip_buf = io.BytesIO()

    with zipfile.ZipFile(
        zip_buf,
        "w",
        zipfile.ZIP_DEFLATED,
    ) as zf:

        for name, data in converted:
            zf.writestr(name, data)

    zip_buf.seek(0)

    return send_file_and_cleanup(
        zip_buf,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"converted_{target_dpi}dpi.zip",
    )


@dpi_bp.route("/check-dpi", methods=["POST"])
def check_dpi():

    files = request.files.getlist("images")

    if not files or all(f.filename == "" for f in files):
        return error("No files provided")

    results = []

    for file in files:

        if not file.filename or not allowed_file(file.filename):

            results.append({
                "filename": file.filename,
                "error": "Unsupported format",
            })

            continue

        try:

            img = Image.open(file.stream)

            try:
                dpi_x, dpi = get_safe_dpi(img)

                results.append({
                    "filename": file.filename,
                    "dpi": (
                        list(dpi)
                        if isinstance(dpi, tuple)
                        else [dpi_x, dpi_x]
                    ),
                    "width_px": img.size[0],
                    "height_px": img.size[1],
                    "format": img.format,
                    "mode": img.mode,
                })
            finally:
                try:
                    img.close()
                except Exception:
                    pass

        except Exception as e:

            results.append({
                "filename": file.filename,
                "error": str(e),
            })

    return success(results, "DPI information extracted successfully.")
