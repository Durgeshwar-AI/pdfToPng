from flask import Blueprint, request
import base64
import fitz
import zipfile
import io
from utils.helpers import error, send_file_and_cleanup, success
from utils.validators import validate_uploaded_file, validate_pdf_file

pdf_bp = Blueprint("pdf", __name__)

@pdf_bp.route("/convertPng", methods=["POST"])
def convert_pdf_to_png():
    doc = None
    pdf_bytes = None
    pix = None
    png_bytes = None

    try:
        pdf_file, filename, upload_error = validate_uploaded_file(
            request,
            "file",
        )

        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(pdf_file, filename)

        if pdf_error:
            return pdf_error

        # Read PDF into memory and open from bytes
        pdf_bytes = pdf_file.read()

        target_lang = request.form.get("language", "eng")

        # Extract page range parameters for selective page conversion.
        # If start_page and end_page are not specified, converts only the first page (backward compatible).
        # Pages are 1-indexed (start_page=1 is the first page).
        start_page_str = request.form.get("start_page", "1")
        end_page_str = request.form.get("end_page", "1")

        try:
            start_page = int(start_page_str)
            end_page = int(end_page_str)
            if start_page < 1 or end_page < start_page:
                return error("Invalid page range. start_page must be >= 1 and <= end_page.")
        except (ValueError, TypeError):
            return error("Invalid page numbers. Must be integers.")

        doc = fitz.open(
            stream=pdf_bytes,
            filetype="pdf",
        )

        try:
            if doc.page_count == 0:
                return error("Empty PDF")

            # Clamp end_page to actual page count
            end_page = min(end_page, doc.page_count)
            if start_page > doc.page_count:
                return error(f"PDF has only {doc.page_count} pages. start_page exceeds page count.")

            zoom = 1.0

            mat = fitz.Matrix(zoom, zoom)

            # Convert requested page range to PNG(s)
            page_count = end_page - start_page + 1
            png_bytes_list = []

            for page_num in range(start_page - 1, end_page):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(
                    matrix=mat,
                    alpha=False,
                )
                png_bytes = (
                    pix.tobytes(output="png")
                    if hasattr(pix, "tobytes")
                    else pix.tobytes()
                )
                png_bytes_list.append((page_num + 1, png_bytes))
                pix = None

            # If single page, use original behavior (backward compatible)
            if page_count == 1:
                png_bytes = png_bytes_list[0][1]
            else:
                # Multiple pages: return zip file with all pages
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                    for page_num, page_png in png_bytes_list:
                        zip_file.writestr(f"page_{page_num}.png", page_png)
                zip_buffer.seek(0)
                png_bytes = zip_buffer.getvalue()

        finally:
            if doc:
                doc.close()
            # Clean up pixmap
            if pix:
                try:
                    pix = None
                except Exception:
                    pass

        # Determine response format and MIME type based on page count
        if page_count > 1:
            mimetype = "application/zip"
            download_name = f"pages_{start_page}-{end_page}.zip"
        else:
            mimetype = "image/png"
            download_name = "converted.png"

        if request.form.get("response_type") == "base64":
            base64_string = base64.b64encode(png_bytes).decode("utf-8")
            # Force garbage collection
            import gc
            gc.collect()
            content_type = "application/zip" if page_count > 1 else "image/png"
            return success(
                {
                    "image_data": (
                        f"data:{content_type};base64,{base64_string}"
                    )
                },
                "Image encoded successfully.",
            )

        response = send_file_and_cleanup(
            png_bytes,
            mimetype=mimetype,
            as_attachment=True,
            download_name=download_name,
        )
        
        # Force garbage collection
        import gc
        gc.collect()
        
        return response

    except Exception:
        # Handle corrupted PDFs gracefully
        return error(
            "The provided PDF file appears to be corrupted or unreadable."
        )
