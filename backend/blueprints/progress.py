"""
SSE (Server-Sent Events) Blueprint for Real-Time Progress
"""

import time
import json
from flask import Blueprint, Response, request, stream_with_context
from utils.progress_manager import progress_manager

progress_bp = Blueprint('progress', __name__)


@progress_bp.route('/progress/<task_id>')
def progress_stream(task_id: str):
    """
    SSE endpoint for progress updates
    Client connects to this endpoint and receives progress updates
    """
    def generate():
        last_percent = -1
        
        while True:
            progress = progress_manager.get_progress(task_id)
            
            if progress:
                # Only send update if progress changed
                current_percent = progress.get('percent', 0)
                
                if current_percent != last_percent or progress.get('status') in ['complete', 'error']:
                    last_percent = current_percent
                    
                    # Send SSE message
                    yield f"data: {json.dumps(progress)}\n\n"
                    
                    # Stop streaming when complete or error
                    if progress.get('status') in ['complete', 'error']:
                        break
            
            # Wait before next check (don't flood)
            time.sleep(0.5)
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'  # Disable nginx buffering
        }
    )


@progress_bp.route('/progress/<task_id>/status')
def get_progress_status(task_id: str):
    """Get current progress status as JSON"""
    from flask import jsonify
    
    progress = progress_manager.get_progress(task_id)
    if progress:
        return jsonify(progress)
    
    return jsonify({'error': 'Task not found'}), 404


@progress_bp.route('/convert-pdf-progress', methods=['POST'])
def convert_pdf_with_progress():
    """
    Example: PDF to PNG conversion with progress tracking
    """
    from flask import jsonify
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Create task for progress tracking
    task_id = progress_manager.create_task()
    
    # Start async processing (simplified - use threading for real implementation)
    import threading
    
    def process():
        try:
            # Simulate processing with progress updates
            total_pages = 10  # In real code, get actual page count
            
            progress_manager.update(task_id, 0, total_pages, "Starting conversion...")
            
            for page in range(1, total_pages + 1):
                # Simulate work
                time.sleep(0.5)
                
                # Update progress
                progress_manager.update(
                    task_id, 
                    page, 
                    total_pages, 
                    f"Processing page {page} of {total_pages}..."
                )
            
            progress_manager.complete(task_id, "/download/result.zip")
            
        except Exception as e:
            progress_manager.error(task_id, str(e))
    
    # Start background thread
    thread = threading.Thread(target=process)
    thread.start()
    
    return jsonify({
        'task_id': task_id,
        'stream_url': f'/progress/{task_id}',
        'status_url': f'/progress/{task_id}/status'
    })