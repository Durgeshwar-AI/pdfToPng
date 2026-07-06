import io

import pytest

from app import create_app
from utils.helpers import send_file_and_cleanup

# Regression coverage for #457: "output PNG filenames derived from upload
# name without sanitisation, path traversal on write".
#
# Investigation: no route in this codebase ever writes a filename-derived
# path to disk. Every conversion route processes uploads in memory
# (BytesIO) and the only place a filename ever reaches the filesystem layer
# is as Flask's `download_name` kwarg to send_file(), which sets the
# Content-Disposition *response header* -- it does not create a file on the
# server using that name. So the exact write-primitive described in the
# issue (server creates /tmp/evil-1.png) is not reachable today.
#
# That said, every route that builds a download_name from the uploaded
# filename relies on validate_uploaded_file() / process_image_request()
# having already run secure_filename() upstream -- a *convention*, not a
# guarantee. These tests lock in a structural fix: send_file_and_cleanup()
# itself now re-sanitises download_name via secure_filename() before
# handing it to Flask, so the protection holds even if a future route adds
# a download_name without going through the upload validators first.


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class _DummyApp:
    """Minimal Flask-app-less context isn't possible for send_file, so these
    unit tests call send_file_and_cleanup inside a real request context via
    the test client's app fixture instead of instantiating Flask directly."""


def test_send_file_and_cleanup_sanitises_traversal_download_name(client):
    app = client.application
    with app.test_request_context("/"):
        response = send_file_and_cleanup(
            b"png bytes",
            mimetype="image/png",
            as_attachment=True,
            download_name="../../../../tmp/evil-1.png",
        )
        disposition = response.headers.get("Content-Disposition", "")

    assert "../" not in disposition
    assert "..\\" not in disposition
    assert "evil-1.png" in disposition or "evil_1.png" in disposition


def test_send_file_and_cleanup_sanitises_absolute_path_download_name(client):
    app = client.application
    with app.test_request_context("/"):
        response = send_file_and_cleanup(
            b"png bytes",
            mimetype="image/png",
            as_attachment=True,
            download_name="/etc/passwd",
        )
        disposition = response.headers.get("Content-Disposition", "")

    assert "/etc/passwd" not in disposition


def test_send_file_and_cleanup_leaves_normal_filenames_untouched(client):
    app = client.application
    with app.test_request_context("/"):
        response = send_file_and_cleanup(
            b"png bytes",
            mimetype="image/png",
            as_attachment=True,
            download_name="my-report-1.png",
        )
        disposition = response.headers.get("Content-Disposition", "")

    assert "my-report-1.png" in disposition


def test_removebg_endpoint_never_reflects_traversal_in_response_headers(client):
    # End-to-end check on a real route that derives download_name from the
    # uploaded filename (backend/blueprints/removebg.py: base = filename...).
    data = {
        "image": (
            io.BytesIO(b"\x89PNG\r\n\x1a\nmock image bytes"),
            "../../../../tmp/evil.png",
            "image/png",
        )
    }
    response = client.post("/removeBg", data=data, content_type="multipart/form-data")

    disposition = response.headers.get("Content-Disposition", "")
    assert "../" not in disposition
