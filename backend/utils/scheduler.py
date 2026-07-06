"""
Background scheduler for maintenance tasks like orphaned temp file cleanup.
"""

import logging
import threading
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from utils.temp_cleanup import cleanup_orphaned_files, cleanup_temp_directory

logger = logging.getLogger(__name__)

scheduler = None


def init_scheduler():
    """Initialize background scheduler with maintenance jobs."""
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler already initialized")
        return scheduler

    scheduler = BackgroundScheduler()

    # Schedule orphaned file cleanup every 6 hours
    # (files older than 24 hours will be removed)
    scheduler.add_job(
        func=cleanup_orphaned_files,
        trigger=CronTrigger(hour="*/6"),
        args=[24],
        id="cleanup_orphaned_files",
        name="Clean up orphaned temp files",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )

    # Schedule temp directory cleanup every 12 hours
    # (files older than 48 hours will be removed)
    scheduler.add_job(
        func=cleanup_temp_directory,
        trigger=CronTrigger(hour="0,12"),
        args=[48],
        id="cleanup_temp_directory",
        name="Clean up temp directory",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )

    try:
        scheduler.start()
        logger.info("Background scheduler started with cleanup jobs")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        scheduler = None
        return None

    return scheduler


def shutdown_scheduler():
    """Gracefully shutdown the scheduler."""
    global scheduler

    if scheduler is None:
        return

    try:
        scheduler.shutdown(wait=True)
        logger.info("Background scheduler shut down")
    except Exception as e:
        logger.error(f"Error shutting down scheduler: {e}")
    finally:
        scheduler = None
