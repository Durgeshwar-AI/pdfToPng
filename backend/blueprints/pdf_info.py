import fitz  # PyMuPDF

from flask import Blueprint, request

from utils.helpers import error, success
from utils.validators import validate_pdf_file, validate_uploaded_file

pdf_info_bp = Blueprint("pdf_info", __name__)

# Common paper sizes (width x height) in points, portrait orientation.
# 1 pt = 1/72 inch
_PAPER_SIZES = {
    (595, 842): "A4",
    (612, 792): "Letter",
    (842, 1191): "A3",
    (420, 595): "A5",
    (612, 1008): "Legal",
    (396, 612): "Statement",
    (720, 1008): "Executive",
    (522, 756): "Folio",
}


def _pts_to_mm(pts):
    return round(pts * 25.4 / 72, 1)


def _guess_size_name(w_pt, h_pt):
    """Return a human-readable paper size name, or 'Custom'."""
    key = (round(w_pt), round(h_pt))
    key_land = (round(h_pt), round(w_pt))
    return _PAPER_SIZES.get(key) or _PAPER_SIZES.get(key_land) or "Custom"


@pdf_info_bp.route("/pdf-info", methods=["POST"])
def get_pdf_info():
    """
    Return metadata about an uploaded PDF without modifying it.

    Request (multipart/form-data):
        file  — the PDF file

    Response (JSON):
        {
            "success": true,
            "file_name": "example.pdf",
            "page_count": 12,
            "file_size_bytes": 204800,
            "file_size_kb": 200.0,
            "pdf_version": "1.7",
            "is_encrypted": false,
            "pages": [
                {
                    "page": 1,
                    "width_pt": 595.28,
                    "height_pt": 841.89,
                    "width_mm": 210.0,
                    "height_mm": 297.0,
                    "size_name": "A4",
                    "orientation": "portrait"
                },
                ...
            ]
        }
    """
    doc = None
    try:
        pdf_file, filename, upload_error = validate_uploaded_file(request, "file")
        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(pdf_file, filename)
        if pdf_error:
            return pdf_error

        pdf_bytes = pdf_file.read()
        file_size = len(pdf_bytes)

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        page_count = doc.page_count
        is_encrypted = doc.is_encrypted

        # PyMuPDF exposes the raw PDF version as an integer, e.g. 17 → "1.7"
        try:
            raw_ver = doc.pdf_version()  # returns int like 17
            pdf_version = f"{raw_ver // 10}.{raw_ver % 10}"
        except Exception:
            pdf_version = "Unknown"

        if page_count == 0:
            return error("The uploaded PDF has no pages.", 400)

        # Collect per-page dimensions — cap at 200 pages to keep response small
        pages_info = []
        sample_limit = min(page_count, 200)
        for i in range(sample_limit):
            page = doc.load_page(i)
            rect = page.rect
            w_pt, h_pt = rect.width, rect.height
            pages_info.append(
                {
                    "page": i + 1,
                    "width_pt": round(w_pt, 2),
                    "height_pt": round(h_pt, 2),
                    "width_mm": _pts_to_mm(w_pt),
                    "height_mm": _pts_to_mm(h_pt),
                    "size_name": _guess_size_name(w_pt, h_pt),
                    "orientation": "portrait" if h_pt >= w_pt else "landscape",
                }
            )

        return success(
            {
                "file_name": filename,
                "page_count": page_count,
                "file_size_bytes": file_size,
                "file_size_kb": round(file_size / 1024, 1),
                "pdf_version": pdf_version,
                "is_encrypted": is_encrypted,
                "pages": pages_info,
            },
	    "PDF information retrieved successfully",
        )

    except fitz.FileDataError:
        return error(
            "The file appears to be corrupted or is not a valid PDF.", 400
        )
    except Exception as e:
        return error(f"Failed to read PDF info: {str(e)}", 500)
    finally:
        if doc:
            doc.close()
