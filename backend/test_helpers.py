import io
import os
import tempfile

import pytest
from flask import Flask

from utils.helpers import error, success, send_file_and_cleanup


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


def test_error_response(app):
    with app.app_context():
        response, status = error("Invalid file")

        assert status == 400
        data = response.get_json()

        assert data["success"] is False
        assert data["message"] == "Invalid file"


def test_success_response(app):
    with app.app_context():
        response, status = success({"id": 1}, "Done")

        assert status == 200
        data = response.get_json()

        assert data["success"] is True
        assert data["message"] == "Done"
        assert data["data"] == {"id": 1}


def test_send_file_from_bytes(app):
    with app.test_request_context():
        response = send_file_and_cleanup(
            b"hello world",
            download_name="sample.txt",
            mimetype="text/plain",
            as_attachment=True,
        )

        assert response.status_code == 200


def test_send_file_from_bytearray(app):
    with app.test_request_context():
        response = send_file_and_cleanup(
            bytearray(b"hello"),
            download_name="sample.txt",
            mimetype="text/plain",
            as_attachment=True,
        )

        assert response.status_code == 200


def test_send_file_from_file_object(app):
    with app.test_request_context():
        bio = io.BytesIO(b"testing")

        response = send_file_and_cleanup(
            bio,
            download_name="sample.txt",
            mimetype="text/plain",
            as_attachment=True,
        )

        assert response.status_code == 200


def test_send_file_from_path_and_cleanup(app):
    fd, path = tempfile.mkstemp(suffix=".txt")

    os.write(fd, b"hello")
    os.close(fd)

    with app.test_request_context():
        response = send_file_and_cleanup(
            path,
            download_name="sample.txt",
            mimetype="text/plain",
            as_attachment=True,
        )

        assert response.status_code == 200

        # Execute after_request callbacks
        app.process_response(response)

    assert not os.path.exists(path)


def test_invalid_file_path(app):
    with app.test_request_context():
        with pytest.raises(Exception):
            send_file_and_cleanup(
                "does_not_exist.txt",
                download_name="sample.txt",
                as_attachment=True,
            )


def test_download_name_is_sanitized(app):
    with app.test_request_context():
        response = send_file_and_cleanup(
            b"hello",
            download_name="../../secret.txt",
            mimetype="text/plain",
            as_attachment=True,
        )

        assert response.status_code == 200

        disposition = response.headers["Content-Disposition"]

        assert ".." not in disposition
        assert "/" not in disposition