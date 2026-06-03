import fitz  # PyMuPDF

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup, safe_gc_collect, log_memory

pdf_bp = Blueprint("pdf", __name__)


@pdf_bp.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    doc = None

    try:
        pdf_file, filename, upload_error = validate_uploaded_file(
            request,
            "file",
        )

        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(filename)

        if pdf_error:
            return pdf_error

        log_memory("convertPng - before read")
        # Read PDF into memory and open from bytes
        pdf_bytes = pdf_file.read()
        log_memory("convertPng - after read")

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        try:
            if doc.page_count == 0:
                return error("Empty PDF")

            page = doc.load_page(0)

            zoom = 1.0

            mat = fitz.Matrix(zoom, zoom)

            pix = page.get_pixmap(
                matrix=mat,
                alpha=False,
            )

            # Get PNG bytes from pixmap
            png_bytes = (
                pix.tobytes(output="png")
                if hasattr(pix, "tobytes")
                else pix.tobytes()
            )

        finally:
            if doc:
                doc.close()
            # release references and collect
            try:
                del pdf_bytes
            except Exception:
                pass
            safe_gc_collect()
            log_memory("convertPng - after close and gc")

        return send_file_and_cleanup(
            png_bytes,
            mimetype="image/png",
            as_attachment=True,
            download_name="converted.png",
        )

    except Exception:
        # Handle corrupted PDFs gracefully
        return error(
            "The provided PDF file appears to be corrupted or unreadable."
        )
