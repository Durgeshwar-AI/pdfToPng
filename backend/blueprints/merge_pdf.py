import os
import tempfile
import threading
from flask import Blueprint, request, jsonify
import fitz
import io

from utils.job_registry import job_registry

merge_pdf_bp = Blueprint("merge_pdf", __name__)


def _process_merge(job_id, files_data):
    merged = fitz.open()
    temp_path = None
    try:
        total = len(files_data)
        job_registry.update(job_id, progress=0, status="processing",
                            message=f"Starting merge of {total} files...")

        for i, (name, data) in enumerate(files_data):
            if not name.lower().endswith(".pdf"):
                raise ValueError(f"'{name}' is not a PDF file.")

            src = fitz.open(stream=data, filetype="pdf")
            merged.insert_pdf(src)
            src.close()

            progress = int(((i + 1) / total) * 85)
            job_registry.update(
                job_id, progress=progress, status="processing",
                message=f"Processed file {i + 1} of {total}...",
            )

        job_registry.update(job_id, progress=90, status="processing",
                            message="Saving merged PDF...")

        output = io.BytesIO()
        merged.save(output)
        output.seek(0)
        data = output.getvalue()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(data)
            temp_path = tmp.name

        job_registry.update(
            job_id, progress=100, status="completed",
            message="PDFs merged successfully!",
            result_path=temp_path, result_mimetype="application/pdf",
            download_name="merged.pdf",
        )
    except Exception as e:
        job_registry.update(job_id, status="failed", message=str(e))
    finally:
        merged.close()


@merge_pdf_bp.route("/merge-pdf", methods=["POST"])
def merge_pdfs():
    files = request.files.getlist("files")

    if not files or len(files) < 2:
        return jsonify({"error": "Please upload at least 2 PDF files."}), 400

    files_data = []
    for f in files:
        files_data.append((f.filename, f.read()))

    job_id = job_registry.create_job()
    job_registry.update(job_id, progress=0, status="processing",
                        message=f"Queued {len(files_data)} files for merging...")

    thread = threading.Thread(
        target=_process_merge, args=(job_id, files_data)
    )
    thread.daemon = True
    thread.start()

    return jsonify({"job_id": job_id}), 202
