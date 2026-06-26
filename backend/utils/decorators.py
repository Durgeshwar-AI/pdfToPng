import functools
import traceback

import fitz
from flask import request

from utils.helpers import error, safe_gc_collect
from utils.validators import (
    MAX_PDF_SIZE,
    validate_image_file,
    validate_pdf_file,
    validate_uploaded_file,
)


def process_image_request(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        file, filename, upload_error = validate_uploaded_file(
            request,
            "image",
        )

        if upload_error:
            return upload_error

        img = None

        try:
            img, file_bytes, image_error = validate_image_file(file)

            if image_error:
                return image_error

            return f(img, filename, file_bytes, *args, **kwargs)

        except ValueError as e:
            return error(str(e), 400)

        except Exception as e:
            traceback.print_exc()
            return error(str(e), 500)

        finally:
            if img:
                try:
                    img.close()
                except Exception:
                    pass

            safe_gc_collect()

    return decorated_function


def process_pdf_request(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        file, filename, upload_error = validate_uploaded_file(
            request,
            "file",
        )

        if upload_error:
            return upload_error

        pdf_error = validate_pdf_file(file, filename)

        if pdf_error:
            return pdf_error

        pdf_bytes = file.read()

        if len(pdf_bytes) > MAX_PDF_SIZE:
            return error(
                f"File exceeds the maximum size of {MAX_PDF_SIZE // (1024 * 1024)}MB.",
                413,
            )

        doc = None

        try:
            password = request.form.get("password", "")
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")

            if password:
                if doc.needs_pass:
                    auth = doc.authenticate(password)
                    if not auth:
                        return error("Invalid password for PDF", 401)

            if doc.page_count == 0:
                return error("Empty PDF", 400)

            return f(doc, filename, pdf_bytes, *args, **kwargs)

        except ValueError as e:
            return error(str(e), 400)

        except Exception as e:
            traceback.print_exc()
            return error(str(e), 500)

        finally:
            if doc:
                try:
                    doc.close()
                except Exception:
                    pass

            safe_gc_collect()

    return decorated_function
