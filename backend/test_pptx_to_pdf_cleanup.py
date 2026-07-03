import io
import os
import subprocess
from unittest.mock import patch

import pytest

from app import create_app

# Regression coverage for #438: "temporary files not cleaned up on
# conversion failure causing disk exhaustion". /convertPptxToPdf is the only
# endpoint in this codebase that writes to disk at all (every other route
# processes uploads fully in memory) -- everything else was audited and
# found to already avoid temp files entirely. This route's cleanup already
# lives in a `finally` block covering both temp_pptx and generated_pdf, so
# there's no live bug to fix here; these tests pin that behavior down as a
# permanent regression guard across every failure branch, since a future
# edit to the try/except/finally structure could easily reintroduce a leak.


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def _pptx_upload():
    return {"file": (io.BytesIO(b"mock pptx bytes"), "deck.pptx")}


def _list_leftover_tmp_files_matching(before, after):
    return sorted(after - before)


def _snapshot_tmp_dir():
    tmp_dir = "/tmp"
    return {
        os.path.join(tmp_dir, name)
        for name in os.listdir(tmp_dir)
        if name.endswith(".pptx") or name.endswith(".pdf")
    }


def test_no_leftover_temp_file_when_libreoffice_exits_non_zero(client):
    before = _snapshot_tmp_dir()

    with patch("blueprints.pptx_to_pdf.subprocess.run") as mock_run:
        mock_run.return_value = subprocess.CompletedProcess(
            args=["libreoffice"], returncode=1, stdout="", stderr="conversion error"
        )

        response = client.post(
            "/convertPptxToPdf", data=_pptx_upload(), content_type="multipart/form-data"
        )

    assert response.status_code == 500

    after = _snapshot_tmp_dir()
    leftover = _list_leftover_tmp_files_matching(before, after)
    assert leftover == [], f"Temp files leaked on LibreOffice failure: {leftover}"


def test_no_leftover_temp_file_when_libreoffice_times_out(client):
    before = _snapshot_tmp_dir()

    with patch("blueprints.pptx_to_pdf.subprocess.run") as mock_run:
        mock_run.side_effect = subprocess.TimeoutExpired(cmd="libreoffice", timeout=60)

        response = client.post(
            "/convertPptxToPdf", data=_pptx_upload(), content_type="multipart/form-data"
        )

    assert response.status_code == 500
    assert "timed out" in response.get_json()["message"].lower()

    after = _snapshot_tmp_dir()
    leftover = _list_leftover_tmp_files_matching(before, after)
    assert leftover == [], f"Temp files leaked on LibreOffice timeout: {leftover}"


def test_no_leftover_temp_file_when_libreoffice_raises_unexpectedly(client):
    before = _snapshot_tmp_dir()

    with patch("blueprints.pptx_to_pdf.subprocess.run") as mock_run:
        mock_run.side_effect = OSError("libreoffice binary not found")

        response = client.post(
            "/convertPptxToPdf", data=_pptx_upload(), content_type="multipart/form-data"
        )

    assert response.status_code == 500

    after = _snapshot_tmp_dir()
    leftover = _list_leftover_tmp_files_matching(before, after)
    assert leftover == [], f"Temp files leaked on unexpected exception: {leftover}"


def test_no_leftover_temp_file_when_libreoffice_produces_no_output(client):
    # LibreOffice exits 0 but the expected output file never appears
    # (e.g. crashed silently, wrong output dir permissions).
    before = _snapshot_tmp_dir()

    with patch("blueprints.pptx_to_pdf.subprocess.run") as mock_run:
        mock_run.return_value = subprocess.CompletedProcess(
            args=["libreoffice"], returncode=0, stdout="", stderr=""
        )

        response = client.post(
            "/convertPptxToPdf", data=_pptx_upload(), content_type="multipart/form-data"
        )

    assert response.status_code == 500
    assert "was not generated" in response.get_json()["message"].lower()

    after = _snapshot_tmp_dir()
    leftover = _list_leftover_tmp_files_matching(before, after)
    assert leftover == [], f"Temp files leaked when no output was produced: {leftover}"


def test_no_leftover_temp_files_on_success(client):
    before = _snapshot_tmp_dir()

    def fake_libreoffice_run(cmd, capture_output, text, timeout):
        # cmd = ["libreoffice", "--headless", "--convert-to", "pdf",
        #        "--outdir", output_dir, temp_pptx]
        temp_pptx_path = cmd[-1]
        generated_pdf_path = os.path.splitext(temp_pptx_path)[0] + ".pdf"
        with open(generated_pdf_path, "wb") as f:
            f.write(b"%PDF-1.4 mock generated pdf")
        return subprocess.CompletedProcess(args=cmd, returncode=0, stdout="", stderr="")

    with patch("blueprints.pptx_to_pdf.subprocess.run", side_effect=fake_libreoffice_run):
        response = client.post(
            "/convertPptxToPdf", data=_pptx_upload(), content_type="multipart/form-data"
        )

    assert response.status_code == 200
    assert response.data.startswith(b"%PDF")

    after = _snapshot_tmp_dir()
    leftover = _list_leftover_tmp_files_matching(before, after)
    assert leftover == [], f"Temp files leaked after a successful conversion: {leftover}"
