import io
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

# Helper to create mock files
def create_mock_file(filename, content=b"fake file content"):
    return (io.BytesIO(content), filename)

def test_docx_to_pdf_endpoint_no_file(client):
    response = client.post("/convertDocxToPdf")
    assert response.status_code in [400, 500]

def test_docx_to_pdf_endpoint_invalid_file(client):
    data = {'file': create_mock_file('test.txt')}
    response = client.post("/convertDocxToPdf", data=data, content_type='multipart/form-data')
    assert response.status_code in [400, 500]

def test_compress_pdf_no_file(client):
    response = client.post("/compress-pdf")
    assert response.status_code in [400, 500]

def test_add_watermark_no_file(client):
    response = client.post("/add-watermark")
    assert response.status_code in [400, 500]

def test_unlock_pdf_no_file(client):
    response = client.post("/unlock-pdf")
    assert response.status_code in [400, 500]

def test_remove_bg_no_file(client):
    response = client.post("/removeBg")
    assert response.status_code in [400, 500]

def test_merge_pdf_no_files(client):
    response = client.post("/merge-pdf")
    assert response.status_code in [400, 500]

def test_md2html_no_file(client):
    response = client.post("/convertMdToHtml")
    assert response.status_code in [400, 404, 500]

def test_pdf_to_docx_no_file(client):
    response = client.post("/convertDocx")
    assert response.status_code in [400, 404, 500]

def test_rotate_flip_no_file(client):
    response = client.post("/rotateFlip")
    assert response.status_code in [400, 404, 500]

def test_sign_pdf_no_file(client):
    response = client.post("/sign/signPdf")
    assert response.status_code in [400, 404, 500]
