import io


def test_convert_png_missing_file(client):
    response = client.post("/convertPng")

    assert response.status_code == 400
    assert response.is_json


def test_convert_png_invalid_file_type(client):
    response = client.post(
        "/convertPng",
        data={
            "file": (io.BytesIO(b"hello"), "hello.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_convert_png_empty_file(client):
    response = client.post(
        "/convertPng",
        data={
            "file": (io.BytesIO(b""), "empty.pdf")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400


def test_convert_png_invalid_content_type(client):
    response = client.post(
        "/convertPng",
        json={"abc": "xyz"}
    )

    assert response.status_code in (400, 415)