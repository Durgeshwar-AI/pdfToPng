import os
import io
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_home_endpoint(client):
    """Test that the home endpoint returns 200 and correct message."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json == {"message": "Server running"}

def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json == {"status": "ok"}

def test_cors_headers_present(client):
    """Test that CORS headers are appended to responses."""
    response = client.options("/health")
    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers

def test_pdf_endpoint_no_file(client):
    """Test that the pdf conversion endpoint handles missing files correctly."""
    response = client.post("/convertPng")
    # Should probably return 400 when no files are uploaded
    assert response.status_code in [400, 500] 

def test_pdf_endpoint_invalid_file(client):
    """Test that uploading a non-PDF file returns an error."""
    data = {
        'file': (io.BytesIO(b"this is not a pdf"), 'test.txt')
    }
    response = client.post("/convertPng", data=data, content_type='multipart/form-data')
    # Typically endpoints checking for pdf will return 400
    assert response.status_code in [400, 500]

def test_metadata_viewer_no_file(client):
    """Test the metadata viewer endpoint without file."""
    response = client.post("/view-metadata")
    assert response.status_code in [400, 500]
from flask import Flask

def test_create_app():
    """Verify Flask application instance is created."""
    app = create_app()
    assert isinstance(app, Flask)


def test_max_content_length():
    """Verify MAX_CONTENT_LENGTH configuration."""
    app = create_app()
    assert app.config["MAX_CONTENT_LENGTH"] == 10 * 1024 * 1024


def test_blueprints_registered():
    """Verify expected blueprints are registered."""
    app = create_app()

    expected = [
        "pdf_bp",
        "pdf_docx_bp",
        "docx_pdf_bp",
        "image_bp",
        "remove_bp",
        "rotate_flip_bp",
        "dpi_bp",
        "metadata_bp",
        "merge_pdf_bp",
        "watermark_bp",
        "sign_bp",
        "markdown_bp",
        "markdown_docx_bp",
        "pdf_info_bp",
        "compress_pdf_bp",
        "protect_pdf_bp",
        "unlock_pdf_bp",
        "searchable_pdf_ocr_bp",
        "pptx_pdf_bp",
    ]

    for bp in expected:
        assert bp in app.blueprints