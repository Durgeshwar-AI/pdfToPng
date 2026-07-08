"""
Temporary file management and cleanup utilities.

Ensures reliable cleanup of temp files on both success and failure paths,
and provides periodic orphaned file cleanup to prevent disk exhaustion.
"""

import os
import tempfile
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List

logger = logging.getLogger(__name__)


class TempFileManager:
    """
    Context manager for safe temp file handling with guaranteed cleanup.

    Usage:
        with TempFileManager(suffix=".pptx") as temp_file:
            temp_file.write(data)
            temp_path = temp_file.name
            # ... use temp_path ...
        # Automatic cleanup happens here, even on exception
    """

    def __init__(self, suffix: str = "", prefix: str = ""):
        self.suffix = suffix
        self.prefix = prefix
        self.temp_file = None
        self.temp_path = None

    def __enter__(self):
        self.temp_file = tempfile.NamedTemporaryFile(
            suffix=self.suffix,
            prefix=self.prefix,
            delete=False
        )
        self.temp_path = self.temp_file.name
        return self.temp_file

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Guaranteed cleanup regardless of exception."""
        if self.temp_file:
            try:
                self.temp_file.close()
            except Exception as e:
                logger.warning(f"Error closing temp file: {e}")

        if self.temp_path and os.path.exists(self.temp_path):
            try:
                os.remove(self.temp_path)
                logger.debug(f"Cleaned up temp file: {self.temp_path}")
            except Exception as e:
                logger.error(f"Failed to cleanup temp file {self.temp_path}: {e}")
                # Log for manual cleanup via cron job
                log_orphaned_file(self.temp_path)

        return False  # Don't suppress exceptions


def cleanup_file(file_path: Optional[str]) -> bool:
    """
    Safely remove a file. Returns True if successful, False otherwise.

    Args:
        file_path: Path to file to remove, or None

    Returns:
        True if file was removed or didn't exist, False if removal failed
    """
    if not file_path:
        return True

    if not os.path.exists(file_path):
        return True

    try:
        os.remove(file_path)
        logger.debug(f"Cleaned up file: {file_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to cleanup file {file_path}: {e}")
        log_orphaned_file(file_path)
        return False


def log_orphaned_file(file_path: str) -> None:
    """
    Log a file as orphaned for later cleanup by cron job.

    Writes to a log file that the periodic cleanup job monitors.
    """
    try:
        orphan_log = Path(tempfile.gettempdir()) / ".pdf_converter_orphaned_files.log"
        with open(orphan_log, "a") as f:
            f.write(f"{file_path}\t{datetime.utcnow().isoformat()}\n")
    except Exception as e:
        logger.warning(f"Could not log orphaned file: {e}")


def cleanup_orphaned_files(max_age_hours: int = 24) -> None:
    """
    Remove orphaned temp files older than max_age_hours.

    Intended to be run periodically (e.g., via cron) to clean up
    files that couldn't be deleted immediately on shutdown.

    Args:
        max_age_hours: Only delete files older than this many hours
    """
    orphan_log = Path(tempfile.gettempdir()) / ".pdf_converter_orphaned_files.log"
    cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
    removed_count = 0
    failed_count = 0

    if not orphan_log.exists():
        logger.debug("No orphaned file log found")
        return

    try:
        with open(orphan_log, "r") as f:
            lines = f.readlines()

        remaining_lines = []

        for line in lines:
            if not line.strip():
                continue

            try:
                file_path, timestamp_str = line.strip().split("\t", 1)
                file_time = datetime.fromisoformat(timestamp_str)

                # Only clean up files older than max_age_hours
                if file_time < cutoff_time:
                    if cleanup_file(file_path):
                        removed_count += 1
                    else:
                        failed_count += 1
                        remaining_lines.append(line)
                else:
                    # Keep recent entries
                    remaining_lines.append(line)
            except Exception as e:
                logger.warning(f"Error processing orphan log entry: {e}")
                remaining_lines.append(line)

        # Rewrite log with remaining entries
        with open(orphan_log, "w") as f:
            f.writelines(remaining_lines)

        logger.info(f"Orphaned file cleanup: removed {removed_count}, failed {failed_count}")

    except Exception as e:
        logger.error(f"Error during orphaned file cleanup: {e}")


def cleanup_temp_directory(max_age_hours: int = 48) -> None:
    """
    Clean up all pdf-converter temp files older than max_age_hours.

    This is a fallback cleanup that scans the temp directory directly
    for any .pptx or .pdf files we created and removes old ones.

    Args:
        max_age_hours: Only delete files older than this many hours
    """
    temp_dir = Path(tempfile.gettempdir())
    cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
    removed_count = 0
    failed_count = 0

    try:
        # Find temp files matching our patterns
        for pattern in ["tmp*.pptx", "tmp*.pdf"]:
            for file_path in temp_dir.glob(pattern):
                try:
                    file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_time < cutoff_time:
                        cleanup_file(str(file_path))
                        removed_count += 1
                except Exception as e:
                    logger.warning(f"Error checking file {file_path}: {e}")
                    failed_count += 1

        logger.info(f"Temp directory cleanup: removed {removed_count}, failed {failed_count}")

    except Exception as e:
        logger.error(f"Error during temp directory cleanup: {e}")
