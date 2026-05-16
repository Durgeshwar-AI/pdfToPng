import os
import fitz
import tempfile
import base64
from utils.celery_utils import celery

@celery.task(bind=True)
def long_pdf_to_png(self, file_content_b64, filename):
    """
    Task to convert PDF to PNG.
    We pass content as b64 because Celery needs serializable data.
    """
    self.update_state(state='PROGRESS', meta={'message': 'Converting PDF...'})
    
    file_content = base64.b64decode(file_content_b64)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        temp_pdf.write(file_content)
        temp_pdf_path = temp_pdf.name

    doc = None
    temp_png_path = None
    try:
        doc = fitz.open(temp_pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0)) # High res
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_png:
            temp_png_path = temp_png.name
        
        pix.save(temp_png_path)
        
        # Read back the PNG as b64 to return
        with open(temp_png_path, 'rb') as f:
            result_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        return {
            'status': 'SUCCESS',
            'result': result_b64,
            'filename': filename.replace('.pdf', '.png')
        }
    finally:
        if doc: doc.close()
        if os.path.exists(temp_pdf_path): os.remove(temp_pdf_path)
        if temp_png_path and os.path.exists(temp_png_path): os.remove(temp_png_path)

@celery.task
def dummy_heavy_task():
    import time
    for i in range(10):
        time.sleep(1)
    return "Finished heavy work"
