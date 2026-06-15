"""
MIME Type Validator using Magic Numbers
Validates file content, not just extensions
"""

import magic
from typing import Union, BinaryIO

ALLOWED_MIME_TYPES = {
    'pdf': ['application/pdf'],
    'jpg': ['image/jpeg', 'image/jpg'],
    'png': ['image/png'],
    'webp': ['image/webp'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'md': ['text/markdown', 'text/plain'],
    'svg': ['image/svg+xml'],
    'txt': ['text/plain'],
}

def validate_file_type(file_bytes: bytes, expected_type: str) -> tuple[bool, str]:
    """
    Validate file using magic numbers (MIME type sniffing)
    
    Args:
        file_bytes: First few bytes of the file
        expected_type: Expected file type ('pdf', 'jpg', 'png', etc.)
    
    Returns:
        (is_valid, error_message)
    """
    try:
        # Read MIME type from file header (magic numbers)
        mime = magic.from_buffer(file_bytes[:1024], mime=True)
        
        allowed = ALLOWED_MIME_TYPES.get(expected_type.lower(), [])
        
        if mime in allowed:
            return True, ""
        else:
            return False, f"Invalid file format. Expected {expected_type.upper()}, got {mime}"
            
    except Exception as e:
        return False, f"MIME detection failed: {str(e)}"


def get_file_mime(file_bytes: bytes) -> str:
    """Get MIME type of file"""
    try:
        return magic.from_buffer(file_bytes[:1024], mime=True)
    except:
        return "unknown"