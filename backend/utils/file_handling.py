import os
import tempfile
from contextlib import contextmanager

@contextmanager
def temp_upload_file(file_storage):
    """
    Saves a Flask FileStorage object to a temporary file and yields the path.
    The file is automatically deleted when the context manager exits.
    """
    fd, path = tempfile.mkstemp()
    os.close(fd)  # Close the file descriptor so save() can open it
    try:
        file_storage.save(path)
        yield path
    finally:
        if os.path.exists(path):
            os.remove(path)
