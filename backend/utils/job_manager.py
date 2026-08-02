import threading
import time
import uuid

_jobs = {}
_lock = threading.Lock()


def create_job():
    """Create a new job entry and return its id."""
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {
            "status": "pending",       # pending | processing | done | error
            "stage": "queued",
            "progress": 0,
            "result": None,            # bytes of the final PNG once done
            "error": None,
            "created_at": time.time(),
        }
    return job_id


def update_job(job_id, **kwargs):
    """Update fields on an existing job."""
    with _lock:
        if job_id in _jobs:
            _jobs[job_id].update(kwargs)


def get_job(job_id):
    """Fetch a job's current state (or None if it doesn't exist / expired)."""
    with _lock:
        return _jobs.get(job_id)


def delete_job(job_id):
    """Remove a job after its result has been delivered."""
    with _lock:
        _jobs.pop(job_id, None)


def cleanup_old_jobs(max_age_seconds=600):
    """Purge jobs older than max_age_seconds to avoid unbounded memory growth.
    Call this periodically (e.g. from a scheduled thread or before creating
    a new job) since this app uses in-memory storage with no external TTL.
    """
    with _lock:
        now = time.time()
        stale = [
            jid for jid, job in _jobs.items()
            if now - job["created_at"] > max_age_seconds
        ]
        for jid in stale:
            del _jobs[jid]