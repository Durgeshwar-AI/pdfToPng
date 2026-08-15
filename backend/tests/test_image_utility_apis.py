import io


def test_remove_bg_missing_file(client):
    response = client.post("/removeBg")

    assert response.status_code == 400
    assert response.is_json


def test_remove_bg_invalid_payload(client):
    response = client.post(
        "/removeBg",
        json={"test": "invalid"}
    )

    assert response.status_code in (400, 415)


def test_remove_bg_unsupported_file(client):
    response = client.post(
        "/removeBg",
        data={
            "file": (io.BytesIO(b"hello"), "sample.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_rotate_flip_missing_file(client):
    response = client.post("/rotateFlip")

    assert response.status_code == 400
    assert response.is_json


def test_rotate_flip_invalid_payload(client):
    response = client.post(
        "/rotateFlip",
        json={"rotate": 90}
    )

    assert response.status_code in (400, 415)


def test_rotate_flip_unsupported_file(client):
    response = client.post(
        "/rotateFlip",
        data={
            "file": (io.BytesIO(b"hello"), "sample.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400

def test_compress_missing_file(client):
    response = client.post("/compress")

    assert response.status_code == 400
    assert response.is_json


def test_compress_unsupported_file(client):
    response = client.post(
        "/compress",
        data={
            "image": (io.BytesIO(b"hello"), "sample.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_compress_rejects_unknown_output_format(client):
    response = client.post(
        "/compress",
        data={
            "image": (io.BytesIO(b"hello"), "sample.png"),
            "format": "gif",
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert "format" in response.get_json()["message"].lower()
