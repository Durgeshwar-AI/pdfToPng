import io


def test_path_traversal_filename(client):
    response = client.post(
        "/convertDocxToPdf",
        data={
            "file": (io.BytesIO(b"dummy"), "../../../secret.docx")
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "../" not in header
    assert "..\\" not in header
import io

def test_nested_path_traversal(client):
    response = client.post(
        "/convertDocxToPdf",
        data={
            "file": (io.BytesIO(b"dummy"), "../../../../folder/test.docx")
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "../" not in header
import io

def test_windows_path_traversal(client):
    response = client.post(
        "/convertDocxToPdf",
        data={
            "file": (io.BytesIO(b"dummy"), "..\\..\\secret.docx")
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "..\\" not in header