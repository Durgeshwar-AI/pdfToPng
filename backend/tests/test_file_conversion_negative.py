import io


def test_convert_docx_to_pdf_missing_file(client):
    response = client.post("/convertDocxToPdf")

    assert response.status_code == 400
    assert response.is_json


def test_convert_docx_missing_file(client):
    response = client.post("/convertDocx")

    assert response.status_code == 400
    assert response.is_json


def test_convert_md_to_html_missing_file(client):
    response = client.post("/convertMdToHtml")

    assert response.status_code == 400
    assert response.is_json

def test_convert_docx_to_pdf_invalid_file(client):
    response = client.post(
        "/convertDocxToPdf",
        data={
            "file": (io.BytesIO(b"Hello"), "sample.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400

def test_convert_docx_invalid_file(client):
    response = client.post(
        "/convertDocx",
        data={
            "file": (io.BytesIO(b"Hello"), "sample.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400

def test_convert_md_to_html_invalid_file(client):
    response = client.post(
        "/convertMdToHtml",
        data={
            "file": (io.BytesIO(b"Hello"), "sample.txt")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400

def test_convert_docx_to_pdf_unsupported_extension(client):
    response = client.post(
        "/convertDocxToPdf",
        data={
            "file": (io.BytesIO(b"abc"), "sample.exe")
        },
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
def test_convert_docx_to_pdf_empty_body(client):
    response = client.post(
        "/convertDocxToPdf",
        data={},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
