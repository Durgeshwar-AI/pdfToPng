def test_compress_pdf_missing_file(client):
    response = client.post("/compress-pdf")

    assert response.status_code == 400
    assert response.is_json


def test_add_watermark_missing_file(client):
    response = client.post("/add-watermark")

    assert response.status_code == 400
    assert response.is_json


def test_unlock_pdf_missing_file(client):
    response = client.post("/unlock-pdf")

    assert response.status_code == 400
    assert response.is_json


def test_merge_pdf_missing_file(client):
    response = client.post("/merge-pdf")

    assert response.status_code == 400
    assert response.is_json


def test_sign_pdf_missing_file(client):
    response = client.post("/sign/signPdf")

    assert response.status_code == 400
    assert response.is_json

