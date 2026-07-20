import io


def test_removebg_path_traversal_filename(client):
    response = client.post(
        "/removeBg",
        data={
            "file": (io.BytesIO(b"dummy"), "../../../secret.png")
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "../" not in header
    assert "..\\" not in header
import io

def test_removebg_nested_path(client):
    response = client.post(
        "/removeBg",
        data={
            "file": (
                io.BytesIO(b"dummy"),
                "../../../../folder/image.png",
            )
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "../" not in header
import io

def test_removebg_windows_path(client):
    response = client.post(
        "/removeBg",
        data={
            "file": (
                io.BytesIO(b"dummy"),
                "..\\..\\secret.png",
            )
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "..\\" not in header
import io

def test_removebg_absolute_path(client):
    response = client.post(
        "/removeBg",
        data={
            "file": (
                io.BytesIO(b"dummy"),
                "/etc/passwd",
            )
        },
        content_type="multipart/form-data",
    )

    header = response.headers.get("Content-Disposition", "")

    assert "/etc/passwd" not in header