"""
Progress Manager for SSE (Server-Sent Events)
Tracks progress of long-running operations
"""

import time
import uuid
from typing import Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Progress:
    """Progress tracking object"""
    task_id: str
    status: str = "pending"  # pending, processing, complete, error
    current: int = 0
    total: int = 0
    message: str = ""
    error: Optional[str] = None
    start_time: float = field(default_factory=time.time)
    end_time: Optional[float] = None
    
    @property
    def percent(self) -> float:
        if self.total == 0:
            return 0
        return (self.current / self.total) * 100
    
    @property
    def elapsed_time(self) -> float:
        if self.end_time:
            return self.end_time - self.start_time
        return time.time() - self.start_time
    
    def to_dict(self) -> dict:
        return {
            "task_id": self.task_id,
            "status": self.status,
            "current": self.current,
            "total": self.total,
            "percent": round(self.percent, 1),
            "message": self.message,
            "error": self.error,
            "elapsed_time": round(self.elapsed_time, 1)
        }


class ProgressManager:
    """Manages progress tracking for multiple tasks"""
    
    def __init__(self):
        self._progress: Dict[str, Progress] = {}
    
    def create_task(self) -> str:
        """Create a new task and return its ID"""
        task_id = str(uuid.uuid4())[:8]
        self._progress[task_id] = Progress(task_id=task_id)
        return task_id
    
    def update(self, task_id: str, current: int, total: int, message: str = ""):
        """Update progress for a task"""
        if task_id in self._progress:
            progress = self._progress[task_id]
            progress.current = current
            progress.total = total
            progress.status = "processing"
            if message:
                progress.message = message
    
    def complete(self, task_id: str, result_url: str = ""):
        """Mark task as complete"""
        if task_id in self._progress:
            self._progress[task_id].status = "complete"
            self._progress[task_id].end_time = time.time()
            if result_url:
                self._progress[task_id].message = result_url
    
    def error(self, task_id: str, error_msg: str):
        """Mark task as failed"""
        if task_id in self._progress:
            self._progress[task_id].status = "error"
            self._progress[task_id].error = error_msg
            self._progress[task_id].end_time = time.time()
    
    def get_progress(self, task_id: str) -> Optional[dict]:
        """Get progress for a task"""
        if task_id in self._progress:
            return self._progress[task_id].to_dict()
        return None
    
    def cleanup_old_tasks(self, max_age_seconds: int = 3600):
        """Remove tasks older than max_age_seconds"""
        now = time.time()
        to_remove = []
        for task_id, progress in self._progress.items():
            if progress.end_time and (now - progress.end_time) > max_age_seconds:
                to_remove.append(task_id)
        for task_id in to_remove:
            del self._progress[task_id]


# Global instance
progress_manager = ProgressManager()