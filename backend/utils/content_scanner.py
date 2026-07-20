"""
Defense-in-depth content scanning for uploaded files.

Two layers, both optional/independent so this degrades gracefully:

1. ClamAV (via `clamd`) - real signature-based malware scanning. Enabled by
   setting CLAMAV_ENABLED=true and pointing CLAMAV_HOST/CLAMAV_PORT at a
   running clamd daemon (see docker-compose.yml's `clamav` service).

2. Structural/heuristic checks - always run, no external service needed.
   Catches classes of attack that a signature scanner might miss or that
   are specific to how this app processes files (PDF active-content
   objects that Poppler/PyMuPDF would otherwise execute/parse, and image
   decompression bombs aimed at PIL).

Nothing here replaces validate_pdf_file()/validate_image_file()'s existing
extension/MIME/magic-byte checks - this runs *in addition*, on the same
bytes, before those bytes are handed to any conversion library.
"""

import os
import logging

from PIL import Image

from utils.helpers import error

logger = logging.getLogger(__name__)

CLAMAV_ENABLED = os.getenv("CLAMAV_ENABLED", "false").strip().lower() == "true"
CLAMAV_HOST = os.getenv("CLAMAV_HOST", "clamav")
CLAMAV_PORT = int(os.getenv("CLAMAV_PORT", "3310"))
CLAMAV_TIMEOUT = float(os.getenv("CLAMAV_TIMEOUT", "10"))

# If ClamAV is enabled but unreachable: fail closed (reject the upload)
# by default, since the whole point of enabling it is mandatory scanning.
# Set CLAMAV_FAIL_OPEN=true only for local dev convenience.
CLAMAV_FAIL_OPEN = os.getenv("CLAMAV_FAIL_OPEN", "false").strip().lower() == "true"

# Applied globally as a floor; individual blueprints (e.g. dpi_converter)
# may set a stricter/looser limit for their own use case, but nothing in
# the app should end up with PIL's decompression-bomb guard fully disabled.
DEFAULT_MAX_IMAGE_PIXELS = int(os.getenv("MAX_IMAGE_PIXELS", "50000000"))
if Image.MAX_IMAGE_PIXELS is None or Image.MAX_IMAGE_PIXELS > DEFAULT_MAX_IMAGE_PIXELS:
    Image.MAX_IMAGE_PIXELS = DEFAULT_MAX_IMAGE_PIXELS

# PDF keywords that indicate active/executable content. This app only
# converts, merges, splits, watermarks, etc. - it never needs a PDF to run
# JavaScript, auto-launch an external program, or fire an open/close action.
# Rejecting these outright removes a whole class of exploit paths through
# the PDF renderer, at essentially zero cost to legitimate use here.
_SUSPICIOUS_PDF_MARKERS = (
    b"/JavaScript",
    b"/JS",
    b"/OpenAction",
    b"/Launch",
    b"/AA",  # additional-actions dictionary (auto-triggered on open/close/etc.)
)

_clamd_client = None
_clamd_init_attempted = False


def _get_clamd_client():
    """Lazily create (and cache) a clamd connection. Returns None if
    ClamAV isn't enabled or clamd can't be reached."""
    global _clamd_client, _clamd_init_attempted

    if not CLAMAV_ENABLED:
        return None

    if _clamd_client is not None:
        return _clamd_client

    if _clamd_init_attempted:
        return None

    _clamd_init_attempted = True

    try:
        import clamd

        client = clamd.ClamdNetworkSocket(
            host=CLAMAV_HOST, port=CLAMAV_PORT, timeout=CLAMAV_TIMEOUT
        )
        client.ping()
        _clamd_client = client
        return _clamd_client
    except Exception as exc:  # noqa: BLE001 - any failure just means "no scanner"
        logger.warning("ClamAV unavailable (%s); %s", exc,
                        "continuing without it (fail-open)" if CLAMAV_FAIL_OPEN
                        else "will reject uploads until it's reachable")
        return None


def _scan_with_clamav(file_bytes):
    """Returns an error() response if ClamAV is enabled and either finds a
    match or (in fail-closed mode) can't be reached. Returns None if the
    file is clean, or if ClamAV isn't enabled at all."""
    if not CLAMAV_ENABLED:
        return None

    client = _get_clamd_client()
    if client is None:
        if CLAMAV_FAIL_OPEN:
            return None
        return error(
            "File scanning service is temporarily unavailable. Please try again shortly.",
            503,
        )

    try:
        import io

        result = client.instream(io.BytesIO(file_bytes))
        status, signature = result.get("stream", (None, None))
        if status == "FOUND":
            logger.warning("ClamAV flagged upload: %s", signature)
            return error(
                "This file was flagged as malicious by our content scanner and cannot be processed.",
                400,
            )
        return None
    except Exception as exc:  # noqa: BLE001
        logger.warning("ClamAV scan failed (%s)", exc)
        if CLAMAV_FAIL_OPEN:
            return None
        return error(
            "File scanning failed. Please try again shortly.",
            503,
        )


def scan_pdf_bytes(file_bytes):
    """Structural/heuristic + (optional) ClamAV scan for PDF uploads."""
    av_error = _scan_with_clamav(file_bytes)
    if av_error:
        return av_error

    for marker in _SUSPICIOUS_PDF_MARKERS:
        if marker in file_bytes:
            return error(
                "This PDF contains active-content elements (JavaScript, "
                "auto-launch, or auto-run actions) that aren't permitted "
                "for security reasons. Please upload a PDF without "
                "embedded scripts or actions.",
                400,
            )

    return None


def scan_image_bytes(file_bytes):
    """(Optional) ClamAV scan for image uploads. Decompression-bomb
    protection is enforced globally above via Image.MAX_IMAGE_PIXELS, and
    is additionally checked by PIL itself on img.load()/img.verify()."""
    return _scan_with_clamav(file_bytes)