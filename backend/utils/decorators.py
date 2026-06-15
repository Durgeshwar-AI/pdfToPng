import functools
import traceback

from flask import request, jsonify

from .mime_validator import validate_file_type
from utils.helpers import error, safe_gc_collect
from utils.validators import (
    validate_image_file,
    validate_uploaded_file,
)


def validate_mime(expected_type: str):
    """
    Decorator to validate file MIME type before processing
    
    Usage:
        @pdf_bp.route('/convertPng', methods=['POST'])
        @validate_mime('pdf')
        def convert_png():
            # file is already validated
            pass
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if file exists
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Read first 1KB for MIME detection
            file_bytes = file.read(1024)
            
            # Reset file pointer so actual processing can read full file
            file.seek(0)
            
            # Validate MIME type
            is_valid, error_msg = validate_file_type(file_bytes, expected_type)
            
            if not is_valid:
                return jsonify({'error': error_msg}), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


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