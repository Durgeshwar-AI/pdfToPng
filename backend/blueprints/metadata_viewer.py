import os
from io import BytesIO

from flask import Blueprint, jsonify
from PIL import Image, ExifTags

from utils.decorators import process_image_request
from utils.helpers import send_file_and_cleanup

metadata_bp = Blueprint("metadata", __name__)

# ── helpers ───────────────────────────────────────────────────────────────────

def _rational_to_float(rational):
    try:
        if isinstance(rational, tuple) and len(rational) == 2:
            return rational[0] / rational[1] if rational[1] else 0
        return float(rational)
    except Exception:
        return None


def _decode(value):
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="ignore").strip("\x00").strip()
    return value


def _gps_to_decimal(dms, ref):
    try:
        d = _rational_to_float(dms[0])
        m = _rational_to_float(dms[1])
        s = _rational_to_float(dms[2])
        decimal = d + (m / 60) + (s / 3600)
        if ref in ("S", "W", b"S", b"W"):
            decimal = -decimal
        return round(decimal, 6)
    except Exception:
        return None


def _format_exposure(value):
    try:
        n, d = value
        if n == 0:
            return "0s"
        if n < d:
            return f"1/{int(d/n)}s"
        return f"{n/d:.2f}s"
    except Exception:
        return str(value)


def _megapixels(w, h):
    return round((w * h) / 1_000_000, 2)


# ── PIL EXIF extraction ───────────────────────────────────────────────────────

def _get_pil_exif(img):
    result = {}
    try:
        raw = img._getexif()
        if not raw:
            return result

        tag_names = {v: k for k, v in ExifTags.TAGS.items()}

        WANTED = {
            "Make":                  "Camera Make",
            "Model":                 "Camera Model",
            "Software":              "Software",
            "DateTime":              "Date Modified",
            "DateTimeOriginal":      "Date Taken",
            "DateTimeDigitized":     "Date Digitized",
            "Artist":                "Artist",
            "Copyright":             "Copyright",
            "ImageDescription":      "Description",
            "UserComment":           "User Comment",
            "ExposureTime":          "Exposure Time",
            "FNumber":               "F-Number",
            "ISOSpeedRatings":       "ISO Speed",
            "FocalLength":           "Focal Length",
            "FocalLengthIn35mmFilm": "Focal Length (35mm)",
            "Flash":                 "Flash",
            "WhiteBalance":          "White Balance",
            "MeteringMode":          "Metering Mode",
            "ExposureMode":          "Exposure Mode",
            "ExposureProgram":       "Exposure Program",
            "SceneCaptureType":      "Scene Type",
            "ColorSpace":            "Color Space",
            "PixelXDimension":       "Pixel Width",
            "PixelYDimension":       "Pixel Height",
            "Orientation":           "Orientation",
            "ResolutionUnit":        "Resolution Unit",
            "XResolution":           "X Resolution",
            "YResolution":           "Y Resolution",
            "BrightnessValue":       "Brightness",
            "LightSource":           "Light Source",
            "DigitalZoomRatio":      "Digital Zoom",
            "Contrast":              "Contrast",
            "Saturation":            "Saturation",
            "Sharpness":             "Sharpness",
            "LensMake":              "Lens Make",
            "LensModel":             "Lens Model",
            "BodySerialNumber":      "Camera Serial",
            "LensSerialNumber":      "Lens Serial",
        }

        FLASH_VALUES = {
            0: "No Flash", 1: "Flash Fired",
            5: "Flash Fired (no strobe return)",
            7: "Flash Fired (auto)", 9: "Flash Fired (compulsory)",
            16: "Flash Not Fired", 24: "Flash Not Fired (auto)",
            25: "Flash Fired (auto, red-eye reduction)",
        }
        ORIENTATION_VALUES = {
            1: "Normal", 2: "Mirrored", 3: "Rotated 180°",
            4: "Mirrored, Rotated 180°", 5: "Mirrored, Rotated 90° CCW",
            6: "Rotated 90° CW", 7: "Mirrored, Rotated 90° CW",
            8: "Rotated 90° CCW",
        }
        METERING_VALUES = {
            0: "Unknown", 1: "Average", 2: "Center-Weighted",
            3: "Spot", 4: "Multi-Spot", 5: "Multi-Segment", 6: "Partial",
        }
        EXPOSURE_PROGRAM = {
            0: "Not Defined", 1: "Manual", 2: "Program AE",
            3: "Aperture Priority", 4: "Shutter Priority",
            5: "Creative (Slow)", 6: "Action (High Speed)",
            7: "Portrait", 8: "Landscape",
        }
        WHITE_BALANCE  = {0: "Auto", 1: "Manual"}
        COLOR_SPACE    = {1: "sRGB", 65535: "Uncalibrated"}
        SCENE_TYPE     = {0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night"}
        RESOLUTION_UNIT = {1: "No unit", 2: "Inch", 3: "Centimetre"}

        for tag_id, value in raw.items():
            tag = ExifTags.TAGS.get(tag_id, str(tag_id))
            label = WANTED.get(tag)
            if label is None:
                continue

            if tag == "ExposureTime":
                result[label] = _format_exposure(value)
            elif tag == "FNumber":
                f = _rational_to_float(value)
                result[label] = f"f/{f:.1f}" if f else str(value)
            elif tag == "FocalLength":
                f = _rational_to_float(value)
                result[label] = f"{f:.1f}mm" if f else str(value)
            elif tag == "FocalLengthIn35mmFilm":
                result[label] = f"{value}mm"
            elif tag == "Flash":
                result[label] = FLASH_VALUES.get(value, f"Value: {value}")
            elif tag == "Orientation":
                result[label] = ORIENTATION_VALUES.get(value, str(value))
            elif tag == "MeteringMode":
                result[label] = METERING_VALUES.get(value, str(value))
            elif tag == "ExposureProgram":
                result[label] = EXPOSURE_PROGRAM.get(value, str(value))
            elif tag == "WhiteBalance":
                result[label] = WHITE_BALANCE.get(value, str(value))
            elif tag == "ColorSpace":
                result[label] = COLOR_SPACE.get(value, str(value))
            elif tag == "SceneCaptureType":
                result[label] = SCENE_TYPE.get(value, str(value))
            elif tag == "ResolutionUnit":
                result[label] = RESOLUTION_UNIT.get(value, str(value))
            elif tag in ("XResolution", "YResolution"):
                f = _rational_to_float(value)
                result[label] = f"{int(f)}" if f else str(value)
            elif tag == "BrightnessValue":
                f = _rational_to_float(value)
                result[label] = f"{f:.2f} EV" if f is not None else str(value)
            elif tag == "DigitalZoomRatio":
                f = _rational_to_float(value)
                result[label] = f"{f:.1f}x" if f else "No zoom"
            elif tag in ("Contrast", "Saturation", "Sharpness"):
                result[label] = {0: "Normal", 1: "Low", 2: "High"}.get(value, str(value))
            elif isinstance(value, bytes):
                decoded = _decode(value)
                if decoded:
                    result[label] = decoded
            else:
                result[label] = value

        # GPS
        gps_tag_id = tag_names.get("GPSInfo")
        if gps_tag_id and gps_tag_id in raw:
            gps_raw = raw[gps_tag_id]
            lat     = gps_raw.get(2)
            lat_ref = gps_raw.get(1)
            lon     = gps_raw.get(4)
            lon_ref = gps_raw.get(3)
            alt     = gps_raw.get(6)

            if lat and lon:
                lat_dec = _gps_to_decimal(lat, lat_ref)
                lon_dec = _gps_to_decimal(lon, lon_ref)
                if lat_dec is not None:
                    result["GPS Latitude"] = lat_dec
                if lon_dec is not None:
                    result["GPS Longitude"] = lon_dec
                result["GPS Maps Link"] = (
                    f"https://maps.google.com/?q={lat_dec},{lon_dec}"
                )
            if alt:
                a = _rational_to_float(alt)
                if a is not None:
                    result["GPS Altitude"] = f"{round(a, 1)}m"

    except Exception:
        pass

    return result


# ── main extraction ───────────────────────────────────────────────────────────

def _extract_metadata(img, file_bytes, filename):
    ext = os.path.splitext(filename)[1].lower()
    metadata = {}

    # Always-available fields
    w, h = img.size
    metadata["File Name"]    = filename
    metadata["Format"]       = img.format or ext.upper().strip(".")
    metadata["Width"]        = f"{w} px"
    metadata["Height"]       = f"{h} px"
    metadata["Megapixels"]   = f"{_megapixels(w, h)} MP"
    metadata["Aspect Ratio"] = f"{round(w/h, 3)}" if h else "N/A"
    metadata["Color Mode"]   = img.mode
    metadata["File Size"]    = f"{round(len(file_bytes) / 1024, 1)} KB"

    mode_bits = {
        "1": "1-bit", "L": "8-bit grayscale", "P": "8-bit palette",
        "RGB": "24-bit", "RGBA": "32-bit", "CMYK": "32-bit",
        "YCbCr": "24-bit", "I": "32-bit int", "F": "32-bit float",
    }
    metadata["Color Depth"] = mode_bits.get(img.mode, img.mode)

    dpi = img.info.get("dpi")
    if dpi:
        metadata["DPI"] = f"{int(dpi[0])} x {int(dpi[1])}"

    # EXIF via PIL (JPEG + TIFF)
    if ext in (".jpg", ".jpeg", ".tiff", ".tif"):
        exif_fields = _get_pil_exif(img)
        metadata.update(exif_fields)

    # PNG text chunks
    if ext == ".png":
        for key in ("Title", "Author", "Description", "Copyright",
                    "Creation Time", "Software", "Comment", "Source"):
            val = img.info.get(key)
            if val:
                metadata[key] = val

    # TIFF tag fallback
    if ext in (".tiff", ".tif") and hasattr(img, "tag_v2"):
        tiff_map = {
            271: "Camera Make", 272: "Camera Model",
            305: "Software",    306: "Date Modified",
            315: "Artist",      33432: "Copyright",
        }
        for tag_id, label in tiff_map.items():
            if label not in metadata:
                val = img.tag_v2.get(tag_id)
                if val:
                    metadata[label] = (
                        _decode(val) if isinstance(val, bytes) else str(val)
                    )

    return metadata

def _analyze_metadata_security(metadata: dict):
    sensitive_fields = {
        "GPS Latitude": "GPS location detected",
        "GPS Longitude": "GPS location detected",
        "GPS Maps Link": "GPS location detected",
        "Camera Make": "Device information detected",
        "Camera Model": "Device information detected",
        "Software": "Software/device metadata detected",
        "Artist": "Author information detected",
        "Copyright": "Ownership information detected",
        "Date Taken": "Timestamp detected",
        "Date Modified": "Timestamp detected",
        "Date Digitized": "Timestamp detected",
        "User Comment": "User-generated hidden data detected",
    }

    found = []
    risk_score = 0

    for key in metadata.keys():
        if key in sensitive_fields:
            found.append({
                "field": key,
                "description": sensitive_fields[key],
                "value": metadata[key]
            })

            # scoring rules
            if "GPS" in key:
                risk_score += 40
            elif key in ("Artist", "Copyright"):
                risk_score += 25
            elif "Date" in key:
                risk_score += 15
            else:
                risk_score += 10

    # cap score
    risk_score = min(risk_score, 100)

    # risk level
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # suggestions
    actions = []

    if any("GPS" in f["field"] for f in found):
        actions.append("Remove GPS metadata")
    if any(f["field"] == "Artist" for f in found):
        actions.append("Remove author information")
    if any("Date" in f["field"] for f in found):
        actions.append("Strip timestamps")
    if found:
        actions.append("Strip all metadata (recommended)")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "sensitive_fields": found,
        "recommended_actions": actions
    }
# ── routes ────────────────────────────────────────────────────────────────────

@metadata_bp.route("/view-metadata", methods=["POST"])
@process_image_request
def view_metadata(img, filename, file_bytes):
    img.load()
    metadata = _extract_metadata(img, file_bytes, filename)
    security_report = _analyze_metadata_security(metadata)

    return jsonify({
        "metadata": metadata,
        "security_report": security_report
    })


@metadata_bp.route("/strip-metadata", methods=["POST"])
@process_image_request
def strip_metadata(img, filename, file_bytes):
    ext = os.path.splitext(filename)[1].lower()
    img.load()
    buf = BytesIO()

    if ext in (".jpg", ".jpeg"):
        clean = img.convert("RGB") if img.mode != "RGB" else img
        clean.save(buf, format="JPEG", quality=95, subsampling=0)
        mimetype, out_ext = "image/jpeg", ".jpg"
    elif ext == ".png":
        clean = Image.new(img.mode, img.size)
        clean.putdata(list(img.getdata()))
        clean.save(buf, format="PNG")
        mimetype, out_ext = "image/png", ".png"
    elif ext in (".tiff", ".tif"):
        img.save(buf, format="TIFF")
        mimetype, out_ext = "image/tiff", ".tiff"
    elif ext == ".bmp":
        img.save(buf, format="BMP")
        mimetype, out_ext = "image/bmp", ".bmp"
    elif ext == ".webp":
        img.save(buf, format="WEBP", quality=95)
        mimetype, out_ext = "image/webp", ".webp"
    else:
        raise ValueError("Unsupported file format")

    buf.seek(0)
    base = os.path.splitext(filename)[0]
    return send_file_and_cleanup(
        buf.getvalue(),
        mimetype=mimetype,
        as_attachment=True,
        download_name=f"{base}_stripped{out_ext}",
    )