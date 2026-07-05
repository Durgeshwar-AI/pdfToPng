import io

import pytest

from app import create_app

# fitz (PyMuPDF) is mocked globally in conftest.py to avoid pulling in the
# native extension during CI. These tests configure that same mock's
# behavior to exercise the encrypted-PDF pre-check added for #456, rather
# than trying to bypass the mock and build a real encrypted PDF.
import fitz  # noqa: E402  (import after conftest mock is installed)


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def _pdf_upload(filename="file.pdf"):
    # A minimal byte sequence satisfying validate_pdf_magic_bytes (must
    # start with the %PDF signature) so the request reaches fitz.open().
    return {"file": (io.BytesIO(b"%PDF-1.4\n%mock pdf content"), filename, "application/pdf")}


def test_encrypted_pdf_returns_clean_422_without_leaking_internals(client):
    # Regression test for #456: previously, a password-protected PDF let
    # PyMuPDF raise deep inside load_page()/get_pixmap(), which fell through
    # to the generic except-Exception handler. It must now be rejected up
    # front with a specific, safe 422 before any further processing.
    mock_doc = fitz.open.return_value
    mock_doc.needs_pass = True

    response = client.post(
        "/convertPng", data=_pdf_upload(), content_type="multipart/form-data"
    )

    assert response.status_code == 422
    body = response.get_json()
    assert body["success"] is False
    assert "password-protected" in body["message"].lower()

    raw = response.get_data(as_text=True)
    for leaked_detail in ["Traceback", ".py", "site-packages"]:
        assert leaked_detail not in raw


def test_unencrypted_pdf_proceeds_past_the_password_check(client):
    # Guards against the new encryption pre-check false-positiving on
    # ordinary PDFs: with needs_pass=False, execution must continue into the
    # normal conversion path (page_count / load_page / get_pixmap), not stop
    # at the 422 added for #456.
    mock_doc = fitz.open.return_value
    mock_doc.needs_pass = False
    mock_doc.page_count = 1

    mock_pixmap = mock_doc.load_page.return_value.get_pixmap.return_value
    mock_pixmap.tobytes.return_value = b"\x89PNG\r\n\x1a\nmock-png-bytes"

    response = client.post(
        "/convertPng",
        data={**_pdf_upload(), "response_type": "base64"},
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert body["data"]["image_data"].startswith("data:image/png;base64,")
    mock_doc.load_page.assert_called_once_with(0)
