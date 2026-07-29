import json
import traceback
from io import BytesIO

import fitz  # PyMuPDF
from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup
from utils.validators import validate_uploaded_file, validate_pdf_file

redact_pdf_bp = Blueprint("redact_pdf", __name__)

# Hard safety caps so a malformed/huge "regions" payload can't be used to
# hang the worker (e.g. thousands of tiny redaction annotations).
MAX_REGIONS = 500


@redact_pdf_bp.route("/redactPdf", methods=["POST"])
def redact_pdf():
    doc = None
    try:
        file, filename, upload_error = validate_uploaded_file(request, "file")
        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(file, filename)
        if pdf_error:
            return pdf_error

        regions_raw = request.form.get("regions")
        if not regions_raw:
            return error("No redaction regions provided.")

        try:
            regions = json.loads(regions_raw)
        except (ValueError, TypeError):
            return error("Invalid regions payload: must be JSON.")

        if not isinstance(regions, list) or len(regions) == 0:
            return error("No redaction regions provided.")

        if len(regions) > MAX_REGIONS:
            return error(f"Too many redaction regions (max {MAX_REGIONS}).")

        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        if doc.page_count == 0:
            return error("Empty PDF")

        # Normalise + validate every region before touching the document,
        # so a bad entry fails fast instead of partially redacting the file.
        by_page = {}
        for i, region in enumerate(regions):
            if not isinstance(region, dict):
                return error(f"Invalid region at index {i}.")

            try:
                page_number = int(region["page"])
                x0 = float(region["x0"])
                y0 = float(region["y0"])
                x1 = float(region["x1"])
                y1 = float(region["y1"])
            except (KeyError, TypeError, ValueError):
                return error(f"Invalid region at index {i}: missing/invalid fields.")

            if not (0 <= page_number < doc.page_count):
                return error(f"Region at index {i} references an out-of-range page.")

            # Coordinates are expected as fractions (0-1) of page width/height,
            # so the frontend never has to know the PDF's point dimensions.
            if not all(0.0 <= v <= 1.0 for v in (x0, y0, x1, y1)):
                return error(f"Region at index {i} has out-of-bounds coordinates.")

            if x1 <= x0 or y1 <= y0:
                return error(f"Region at index {i} has a zero/negative area.")

            by_page.setdefault(page_number, []).append((x0, y0, x1, y1))

        for page_number, page_regions in by_page.items():
            page = doc[page_number]
            page_rect = page.rect

            for (x0, y0, x1, y1) in page_regions:
                rect = fitz.Rect(
                    page_rect.x0 + x0 * page_rect.width,
                    page_rect.y0 + y0 * page_rect.height,
                    page_rect.x0 + x1 * page_rect.width,
                    page_rect.y0 + y1 * page_rect.height,
                )
                # add_redact_annot marks the area; apply_redactions (below)
                # actually deletes the underlying text/image content beneath
                # it and paints the fill color - this is a real strip, not a
                # cosmetic overlay.
                page.add_redact_annot(rect, fill=(0, 0, 0))

            # images=2 also removes any image XObjects fully inside a
            # redaction box, not just drawn-over text.
            page.apply_redactions(images=2)

        output = BytesIO()
        doc.save(output, garbage=4, deflate=True)
        output.seek(0)
        redacted_bytes = output.getvalue()

        doc.close()
        doc = None

        return send_file_and_cleanup(
            redacted_bytes,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="redacted.pdf",
        )

    except Exception as e:
        traceback.print_exc()
        return error(str(e), 500)
    finally:
        if doc is not None:
            doc.close()
            