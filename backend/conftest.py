import sys
from unittest.mock import MagicMock

# Mock out problematic C-extensions and modules
mock_modules = [
    'fitz',
    'docx',
    'docx.shared',
    'reportlab',
    'reportlab.lib',
    'reportlab.lib.pagesizes',
    'reportlab.lib.styles',
    'reportlab.platypus',
    'pdf2image',
    'PIL',
    'pdf2docx',
    'markdown2',
    'bs4',
    'PyPDF2',
    'rembg',
    'numpy',
    'skimage',
    'piexif',
    'pytesseract',
    'cv2',
]

for mod in mock_modules:
    try:
        __import__(mod)
    except ImportError:
        mock = MagicMock()
        mock.__version__ = "2.0.0"
        sys.modules[mod] = mock
