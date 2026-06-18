import subprocess
import shutil

def check_poppler_installed():
    """Check if poppler-utils is installed"""
    return shutil.which("pdfinfo") is not None

def check_tesseract_installed():
    """Check if tesseract-ocr is installed"""
    return shutil.which("tesseract") is not None

def check_ghostscript_installed():
    """Check if ghostscript is installed"""
    return shutil.which("gs") is not None

def get_all_dependencies():
    """Get status of all dependencies"""
    return {
        "poppler-utils": {
            "installed": check_poppler_installed(),
            "required_for": ["PDF to PNG", "PDF to DOCX"],
            "install_command": "apt-get install poppler-utils",
            "brew_command": "brew install poppler",
            "windows_command": "conda install -c conda-forge poppler"
        },
        "tesseract-ocr": {
            "installed": check_tesseract_installed(),
            "required_for": ["Image OCR"],
            "install_command": "apt-get install tesseract-ocr",
            "brew_command": "brew install tesseract"
        },
        "ghostscript": {
            "installed": check_ghostscript_installed(),
            "required_for": ["PDF compression"],
            "optional": True,
            "install_command": "apt-get install ghostscript",
            "brew_command": "brew install ghostscript"
        }
    }