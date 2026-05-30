import uuid
import threading
import time
import os

class JobRegistry:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._jobs = {}
                    cls._instance._data_lock = threading.Lock()
                    cls._instance._cleanup_interval = 300
        return cls._instance

    def create_job(self):
        job_id = str(uuid.uuid4())
        with self._data_lock:
            self._jobs[job_id] = {
                "progress": 0,
                "status": "pending",
                "message": "Job created",
                "result_path": None,
                "result_mimetype": None,
                "download_name": None,
                "created_at": time.time(),
            }
        return job_id

    def update(self, job_id, progress=None, status=None, message=None,
               result_path=None, result_mimetype=None, download_name=None):
        with self._data_lock:
            if job_id in self._jobs:
                if progress is not None:
                    self._jobs[job_id]["progress"] = progress
                if status is not None:
                    self._jobs[job_id]["status"] = status
                if message is not None:
                    self._jobs[job_id]["message"] = message
                if result_path is not None:
                    self._jobs[job_id]["result_path"] = result_path
                if result_mimetype is not None:
                    self._jobs[job_id]["result_mimetype"] = result_mimetype
                if download_name is not None:
                    self._jobs[job_id]["download_name"] = download_name

    def get_job(self, job_id):
        with self._data_lock:
            job = self._jobs.get(job_id)
            if job is not None:
                return dict(job)
            return None

    def cleanup(self):
        now = time.time()
        with self._data_lock:
            expired = [
                jid for jid, job in self._jobs.items()
                if job["status"] in ("completed", "failed", "error")
                and now - job.get("created_at", 0) > self._cleanup_interval
            ]
            for jid in expired:
                job = self._jobs[jid]
                if job.get("result_path"):
                    try:
                        if os.path.exists(job["result_path"]):
                            os.remove(job["result_path"])
                    except Exception:
                        pass
                del self._jobs[jid]

    def cleanup_all(self):
        with self._data_lock:
            for job in self._jobs.values():
                if job.get("result_path"):
                    try:
                        if os.path.exists(job["result_path"]):
                            os.remove(job["result_path"])
                    except Exception:
                        pass
            self._jobs.clear()


job_registry = JobRegistry()
