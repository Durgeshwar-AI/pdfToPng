import os
from flask import Blueprint, jsonify, send_file

from utils.job_registry import job_registry
from utils.helpers import error

status_bp = Blueprint("status", __name__)


@status_bp.route("/api/status/<job_id>", methods=["GET"])
def get_job_status(job_id):
    job = job_registry.get_job(job_id)
    if not job:
        return error("Job not found", 404)
    return jsonify({
        "progress": job["progress"],
        "status": job["status"],
        "message": job["message"],
    })


@status_bp.route("/api/download/<job_id>", methods=["GET"])
def download_job_result(job_id):
    job = job_registry.get_job(job_id)
    if not job:
        return error("Job not found", 404)
    if job["status"] != "completed":
        return error("Job not yet completed", 400)
    result_path = job.get("result_path")
    if not result_path or not os.path.exists(result_path):
        return error("Result file not found", 404)
    return send_file(
        result_path,
        mimetype=job.get("result_mimetype", "application/octet-stream"),
        as_attachment=True,
        download_name=job.get("download_name", "download"),
    )
