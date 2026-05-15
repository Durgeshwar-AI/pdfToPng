import gc
import os
from flask import jsonify, after_this_request, send_file


def error(msg, code=400):
    return jsonify({"error": msg}), code


def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass


def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file and deletes it after the request is completed.
    """
    @after_this_request
    def cleanup(response):
        try:
            if os.path.exists(filename):
                os.remove(filename)
        except Exception:
            pass
        return response

    return send_file(filename, **kwargs)
