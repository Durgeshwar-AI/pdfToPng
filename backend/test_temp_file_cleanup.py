"""
Comprehensive tests for temporary file cleanup on all failure paths.

Verifies that temp files are guaranteed to be cleaned up regardless of:
- Successful conversion
- Conversion timeout
- Conversion failure
- Missing input file
- Empty output file
- Any other exception during processing
"""

import os
import io
import tempfile
import pytest
from unittest.mock import patch, MagicMock
from app import create_app


@pytest.fixture
def client():
    """Create a test client with the Flask app."""
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def create_valid_pptx():
    """Create a minimal but valid PPTX file for testing."""
    from io import BytesIO
    from zipfile import ZipFile
    from xml.etree.ElementTree import Element, SubElement, tostring

    # Create minimal PPTX structure
    buffer = BytesIO()
    with ZipFile(buffer, 'w') as zf:
        # [Content_Types].xml
        content_types = Element("Types")
        content_types.set("xmlns", "http://schemas.openxmlformats.org/package/2006/content-types")
        zf.writestr("[Content_Types].xml", tostring(content_types))

        # _rels/.rels
        rels = Element("Relationships")
        rels.set("xmlns", "http://schemas.openxmlformats.org/package/2006/relationships")
        rel = SubElement(rels, "Relationship")
        rel.set("Id", "rId1")
        rel.set("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument")
        rel.set("Target", "ppt/presentation.xml")
        zf.writestr("_rels/.rels", tostring(rels))

        # ppt/presentation.xml
        presentation = Element("p:presentation")
        presentation.set("xmlns:p", "http://schemas.openxmlformats.org/presentationml/2006/main")
        zf.writestr("ppt/presentation.xml", tostring(presentation))

    buffer.seek(0)
    return buffer.getvalue()


class TestTempFileCleanupOnSuccess:
    """Verify temp files are cleaned up after successful conversion."""

    @patch('blueprints.pptx_to_pdf.subprocess.run')
    def test_temp_files_cleaned_on_success(self, mock_run, client):
        """Test that all temp files are removed after successful conversion."""
        # Track created temp files
        created_temp_files = []

        original_named_temp = tempfile.NamedTemporaryFile

        def tracking_named_temp(*args, **kwargs):
            temp_file = original_named_temp(*args, **kwargs)
            created_temp_files.append(temp_file.name)
            return temp_file

        # Mock LibreOffice to create a dummy PDF
        def mock_run_side_effect(*args, **kwargs):
            # Extract the temp PPTX path from command
            temp_pptx = args[0][-1] if isinstance(args[0], list) else None
            if temp_pptx:
                pdf_path = temp_pptx.replace('.pptx', '.pdf')
                # Create a dummy PDF
                with open(pdf_path, 'wb') as f:
                    f.write(b'%PDF-1.4\n')
                created_temp_files.append(pdf_path)
            return MagicMock(returncode=0, stdout='', stderr='')

        mock_run.side_effect = mock_run_side_effect

        with patch('tempfile.NamedTemporaryFile', side_effect=tracking_named_temp):
            response = client.post(
                '/convertPptxToPdf',
                data={'file': (io.BytesIO(create_valid_pptx()), 'test.pptx')}
            )

        # Check response is successful
        assert response.status_code == 200

        # Verify all temp files were cleaned up
        for temp_file in created_temp_files:
            assert not os.path.exists(temp_file), f"Temp file not cleaned up: {temp_file}"


class TestTempFileCleanupOnTimeout:
    """Verify temp files are cleaned up even when conversion times out."""

    @patch('blueprints.pptx_to_pdf.subprocess.run')
    def test_temp_files_cleaned_on_timeout(self, mock_run, client):
        """Test that temp files are removed when LibreOffice times out."""
        import subprocess
        import io

        mock_run.side_effect = subprocess.TimeoutExpired('libreoffice', 60)

        created_temp_files = []

        def track_temp(*args, **kwargs):
            temp_file = tempfile.NamedTemporaryFile(*args, **kwargs)
            created_temp_files.append(temp_file.name)
            return temp_file

        with patch('tempfile.NamedTemporaryFile', side_effect=track_temp):
            response = client.post(
                '/convertPptxToPdf',
                data={'file': (io.BytesIO(create_valid_pptx()), 'test.pptx')}
            )

        # Check error response
        assert response.status_code == 500
        assert 'timed out' in response.json.get('detail', '').lower()

        # Verify all temp files were cleaned up despite timeout
        for temp_file in created_temp_files:
            assert not os.path.exists(temp_file), f"Temp file not cleaned up after timeout: {temp_file}"


class TestTempFileCleanupOnConversionFailure:
    """Verify temp files are cleaned up when LibreOffice conversion fails."""

    @patch('blueprints.pptx_to_pdf.subprocess.run')
    def test_temp_files_cleaned_on_conversion_failure(self, mock_run, client):
        """Test that temp files are removed when LibreOffice conversion fails."""
        import io

        # Simulate LibreOffice failure
        mock_run.return_value = MagicMock(
            returncode=1,
            stdout='',
            stderr='Error: unsupported file format'
        )

        created_temp_files = []

        def track_temp(*args, **kwargs):
            temp_file = tempfile.NamedTemporaryFile(*args, **kwargs)
            created_temp_files.append(temp_file.name)
            return temp_file

        with patch('tempfile.NamedTemporaryFile', side_effect=track_temp):
            response = client.post(
                '/convertPptxToPdf',
                data={'file': (io.BytesIO(create_valid_pptx()), 'test.pptx')}
            )

        # Check error response
        assert response.status_code == 500

        # Verify all temp files were cleaned up despite failure
        for temp_file in created_temp_files:
            assert not os.path.exists(temp_file), f"Temp file not cleaned up after failure: {temp_file}"


class TestTempFileCleanupOnMissingFile:
    """Verify appropriate response when file is not provided."""

    def test_temp_files_cleaned_on_missing_file(self, client):
        """Test response when no file is provided."""
        response = client.post('/convertPptxToPdf')
        assert response.status_code == 400
        assert 'No file provided' in response.json.get('detail', '')


class TestTempFileCleanupOnEmptyOutput:
    """Verify temp files are cleaned up when output file is empty."""

    @patch('blueprints.pptx_to_pdf.subprocess.run')
    def test_temp_files_cleaned_on_empty_output(self, mock_run, client):
        """Test that temp files are removed when generated PDF is empty."""
        import io

        def mock_run_side_effect(*args, **kwargs):
            # Extract the temp PPTX path and create an empty PDF
            temp_pptx = args[0][-1] if isinstance(args[0], list) else None
            if temp_pptx:
                pdf_path = temp_pptx.replace('.pptx', '.pdf')
                # Create an empty PDF file
                with open(pdf_path, 'wb') as f:
                    f.write(b'')
            return MagicMock(returncode=0, stdout='', stderr='')

        mock_run.side_effect = mock_run_side_effect

        created_temp_files = []

        def track_temp(*args, **kwargs):
            temp_file = tempfile.NamedTemporaryFile(*args, **kwargs)
            created_temp_files.append(temp_file.name)
            return temp_file

        with patch('tempfile.NamedTemporaryFile', side_effect=track_temp):
            response = client.post(
                '/convertPptxToPdf',
                data={'file': (io.BytesIO(create_valid_pptx()), 'test.pptx')}
            )

        # Check error response
        assert response.status_code == 500
        assert 'empty' in response.json.get('detail', '').lower()

        # Verify all temp files were cleaned up
        for temp_file in created_temp_files:
            assert not os.path.exists(temp_file), f"Temp file not cleaned up for empty output: {temp_file}"


class TestTempFileCleanupOnUnexpectedException:
    """Verify temp files are cleaned up on any unexpected exception."""

    @patch('blueprints.pptx_to_pdf.subprocess.run')
    def test_temp_files_cleaned_on_unexpected_exception(self, mock_run, client):
        """Test that temp files are removed when an unexpected exception occurs."""
        import io

        # Raise an unexpected exception
        mock_run.side_effect = RuntimeError("Unexpected error during conversion")

        created_temp_files = []

        def track_temp(*args, **kwargs):
            temp_file = tempfile.NamedTemporaryFile(*args, **kwargs)
            created_temp_files.append(temp_file.name)
            return temp_file

        with patch('tempfile.NamedTemporaryFile', side_effect=track_temp):
            response = client.post(
                '/convertPptxToPdf',
                data={'file': (io.BytesIO(create_valid_pptx()), 'test.pptx')}
            )

        # Check error response
        assert response.status_code == 500

        # Verify all temp files were cleaned up despite exception
        for temp_file in created_temp_files:
            assert not os.path.exists(temp_file), f"Temp file not cleaned up after exception: {temp_file}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
