import gc
from flask import jsonify


def error(msg, code=400):
    return jsonify({"error": msg}), code


def safe_gc_collect():
    try:
        gc.collect()
    except Exception:
        pass
