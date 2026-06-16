def send_file_and_cleanup(filename, **kwargs):
    """
    Sends a file and deletes it after the request is completed.
    Also forces garbage collection for large responses.
    """
    # Support bytes or file-like objects to avoid touching disk
    try:
        from io import BytesIO

        # If raw bytes are passed, wrap in BytesIO and send directly
        if isinstance(filename, (bytes, bytearray)):
            bio = BytesIO(filename)
            bio.seek(0)
            response = send_file(bio, **kwargs)
            
            # Force garbage collection after response
            safe_gc_collect()
            
            # Close the buffer after response
            @after_this_request
            def cleanup_buffer(response):
                try:
                    bio.close()
                except Exception:
                    pass
                safe_gc_collect()
                return response
            
            return response

        # If a file-like object is passed, ensure it's at start and send
        if hasattr(filename, "read"):
            try:
                filename.seek(0)
            except Exception:
                pass
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response

        # Otherwise treat as a filesystem path and schedule cleanup
        filepath = filename

        @after_this_request
        def cleanup(response):
            try:
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception:
                pass
            safe_gc_collect()
            return response

        response = send_file(filepath, **kwargs)
        safe_gc_collect()
        return response
        
    except Exception:
        # Fallback: attempt to send as path
        try:
            response = send_file(filename, **kwargs)
            safe_gc_collect()
            return response
        except Exception:
            raise