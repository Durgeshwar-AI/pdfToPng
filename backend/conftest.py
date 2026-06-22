import sys
from unittest.mock import MagicMock

# Mock out problematic C-extensions and modules
mock_modules = [
    'fitz',
    'docx',
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
]

for mod in mock_modules:
    sys.modules[mod] = MagicMock()
