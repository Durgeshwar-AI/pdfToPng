import os
import io
import pytest
from flask import Flask
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
    assert response.status_code == 400

def test_pdf_endpoint_invalid_file(client):
    """Test that uploading a non-PDF file returns an error."""
    data = {
        'file': (io.BytesIO(b"this is not a pdf"), 'test.txt')
    }
    response = client.post("/convertPng", data=data, content_type='multipart/form-data')
    assert response.status_code == 400

def test_metadata_viewer_no_file(client):
    """Test the metadata viewer endpoint without file."""
    response = client.post("/view-metadata")
    assert response.status_code == 400

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
        "pdf",
        "pdf_docx",
        "docx_pdf",
        "image",
        "removebg",
        "rotate_flip",
        "dpi_converter",
        "metadata",
        "merge_pdf",
        "watermark",
        "sign",
        "markdown",
        "markdown_docx",
        "pdf_info",
        "compress_pdf",
        "protect_pdf",
        "unlock_pdf",
        "searchable_pdf_ocr",
        "pptx_pdf",
        "pdf_xlsx",
    ]

    for bp in expected:
        assert bp in app.blueprints
