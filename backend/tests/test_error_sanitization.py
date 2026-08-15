"""
Error messages must never carry a filesystem path back to the client.

A crafted PDF can steer which path a third-party library names in its
exception text (for example a font reference pointing at /etc/passwd), so the
sanitizer is the last line of defence for every endpoint.
"""

import io

from utils.helpers import error, sanitize_error_message


LEAKY_MESSAGES = [
    # The exact shape reported for crafted font references.
    "/etc/passwd: not a valid font file",
    "cannot open /etc/shadow",
    "/app/config.env could not be read",
    "no such file: /home/user/documents/report.pdf",
    "font lookup failed at /root/.ssh/id_rsa",
    "~/.ssh/id_rsa is not readable",
    "C:\\Users\\admin\\secrets.txt is missing",
    "\\\\fileserver\\share\\credentials.txt unreachable",
    "failed reading /tmp/upload_a1b2/font.ttf",
    "failed reading /var/tmp/scratch/font.ttf",
]

LEAKY_FRAGMENTS = [
    "/etc/passwd",
    "/etc/shadow",
    "/app/config.env",
    "/home/user",
    "/root/.ssh",
    "~/.ssh",
    "C:\\Users",
    "fileserver",
    "/tmp/upload_a1b2",
    "/var/tmp/scratch",
]


def test_absolute_paths_are_stripped_from_error_messages():
    for message in LEAKY_MESSAGES:
        sanitized = sanitize_error_message(message)

        for fragment in LEAKY_FRAGMENTS:
            assert fragment not in sanitized, (
                f"{fragment!r} leaked through sanitizing {message!r}"
            )


def test_two_segment_posix_paths_are_redacted():
    # Short paths are the interesting case: a single leading directory is all
    # an attacker needs to confirm a file exists on the server.
    assert sanitize_error_message("/etc/passwd not found") == (
        "**path** not found"
    )


def test_temp_paths_keep_their_own_label():
    assert sanitize_error_message("wrote /tmp/abc/font.ttf") == "wrote **temp**"


def test_non_path_text_is_left_alone():
    # Over-eager redaction would hide legitimate detail from users.
    for message in [
        "Invalid image MIME type: image/png is not application/pdf",
        "Choose png and/or jpeg",
        "GET /health returned 500",
        "See https://example.com/docs/errors for help",
    ]:
        assert sanitize_error_message(message) == message


def test_long_messages_are_truncated():
    sanitized = sanitize_error_message("x" * 600)

    assert len(sanitized) == 500
    assert sanitized.endswith("...")


def test_missing_or_non_string_messages_are_replaced():
    for message in [None, "", 123, {"path": "/etc/passwd"}]:
        assert sanitize_error_message(message) == "An error occurred"


def test_error_response_body_is_sanitized(app):
    with app.test_request_context():
        response, status = error("/etc/passwd: not a valid font file", 500)

    assert status == 500
    assert "/etc/passwd" not in response.get_json()["message"]


def _post_pdf(client, route, payload=b"%PDF-1.7\nnot actually a pdf"):
    return client.post(
        route,
        data={"file": (io.BytesIO(payload), "crafted.pdf", "application/pdf")},
        content_type="multipart/form-data",
    )


def _detail(response):
    body = response.get_json()
    return str(body.get("message") or body.get("error") or "")


def test_pdf_to_xlsx_does_not_echo_library_exception_text(client):
    # A payload that passes the signature check but fails to parse takes the
    # endpoint down its generic exception path.
    response = _post_pdf(client, "/convertXlsx")

    assert response.status_code == 500

    detail = _detail(response)
    assert "Traceback" not in detail
    for fragment in ("/etc/", "/usr/", "/home/", "site-packages", ".py"):
        assert fragment not in detail, f"leaked {fragment!r} in: {detail!r}"


def test_searchable_pdf_ocr_does_not_echo_library_exception_text(
    client, monkeypatch
):
    # Stand in for a crafted PDF whose font reference makes the PDF library
    # name a server path in its exception text.
    from blueprints import searchable_pdf_ocr

    def fake_open(*args, **kwargs):
        if kwargs.get("stream") is not None:
            raise RuntimeError("/etc/passwd: not a valid font file")
        return searchable_pdf_ocr.fitz.Document()

    monkeypatch.setattr(searchable_pdf_ocr.fitz, "open", fake_open)

    response = _post_pdf(client, "/searchable-pdf-ocr")

    assert response.status_code == 500

    detail = _detail(response)
    assert "/etc/passwd" not in detail
    assert "not a valid font file" not in detail
