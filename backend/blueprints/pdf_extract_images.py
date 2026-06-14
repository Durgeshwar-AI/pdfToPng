"""
PDF Embedded Images Extractor
Extracts raw raster images (JPEG/PNG) from PDF files without re-compression
"""

import fitz  # PyMuPDF
import io
import zipfile
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename

pdf_extract_images_bp = Blueprint('pdf_extract_images', __name__)


def extract_images_from_pdf(pdf_bytes, original_filename="document"):
    """Extract all embedded images from a PDF file"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        if len(doc) == 0:
            return "PDF file is empty or corrupted", None, None
        
        zip_buffer = io.BytesIO()
        total_images = 0
        image_names = []
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                image_list = page.get_images(full=True)
                
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    
                    try:
                        pix = fitz.Pixmap(doc, xref)
                        
                        if pix.n - pix.alpha < 4:
                            img_data = pix.tobytes("png")
                            ext = "png"
                        else:
                            pix = fitz.Pixmap(fitz.csRGB, pix)
                            img_data = pix.tobytes("png")
                            ext = "png"
                        
                        pix = None
                        
                        base_name = secure_filename(original_filename).replace('.pdf', '')
                        img_filename = f"{base_name}_page{page_num+1}_{img_index+1}.{ext}"
                        
                        zip_file.writestr(img_filename, img_data)
                        image_names.append(img_filename)
                        total_images += 1
                        
                    except Exception as e:
                        print(f"Error: {str(e)}")
                        continue
            
            doc.close()
            
            if total_images == 0:
                return "No embedded images found in this PDF", None, None
            
            metadata = f"""Extracted Images Report
PDF File: {original_filename}
Total Images Found: {total_images}
Extracted Images:
{chr(10).join(f'- {name}' for name in image_names)}
"""
            zip_file.writestr("extraction_report.txt", metadata)
        
        zip_buffer.seek(0)
        return zip_buffer, total_images, image_names
        
    except Exception as e:
        return f"Error processing PDF: {str(e)}", None, None


@pdf_extract_images_bp.route('/extract-pdf-images', methods=['POST'])
def extract_images():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        pdf_bytes = file.read()
        result, count, names = extract_images_from_pdf(pdf_bytes, file.filename)
        
        if count is None:
            return jsonify({'error': result}), 400
        
        return send_file(
            result,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f"{file.filename.replace('.pdf', '')}_extracted_images.zip"
        )
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@pdf_extract_images_bp.route('/preview-pdf-images', methods=['POST'])
def preview_images():
    import base64
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '' or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Valid PDF required'}), 400
    
    try:
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        previews = []
        count = 0
        
        for page_num in range(min(len(doc), 3)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list[:3]):
                if count >= 9:
                    break
                    
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.n - pix.alpha >= 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                
                img_data = pix.tobytes("png")
                b64 = base64.b64encode(img_data).decode('utf-8')
                
                previews.append({
                    'page': page_num + 1,
                    'index': img_index + 1,
                    'data': f'data:image/png;base64,{b64}'
                })
                count += 1
                pix = None
        
        doc.close()
        
        return jsonify({
            'success': True,
            'total_previews': len(previews),
            'previews': previews
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500