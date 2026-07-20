from utils.helpers import send_file_and_cleanup
import io

def test_normal_filename(app):
    with app.app_context():
        response = send_file_and_cleanup(
            io.BytesIO(b"Hello"),
            mimetype="text/plain",
            download_name="hello.txt",
        )

        assert "hello.txt" in response.headers["Content-Disposition"]
import io

def test_path_traversal_removed(app):
    with app.app_context():
        response = send_file_and_cleanup(
            io.BytesIO(b"Hello"),
            mimetype="text/plain",
            download_name="../../../secret.txt",
        )

        header = response.headers["Content-Disposition"]

        assert "../" not in header
import io

def test_windows_traversal_removed(app):
    with app.app_context():
        response = send_file_and_cleanup(
            io.BytesIO(b"Hello"),
            mimetype="text/plain",
            download_name="..\\..\\secret.txt",
        )

        header = response.headers["Content-Disposition"]

        assert "..\\" not in header

import io

def test_absolute_path_removed(app):
    with app.app_context():
        response = send_file_and_cleanup(
            io.BytesIO(b"Hello"),
            mimetype="text/plain",
            download_name="/etc/passwd",
        )

        header = response.headers["Content-Disposition"]

        assert "/etc/passwd" not in header