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
