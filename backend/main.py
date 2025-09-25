import fitz
import io
import os
from flask import Flask, request, send_file
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app)

@app.route('/convertPng', methods=['POST'])
def convert_pdf():
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}, 400

        pdf_file = request.files['file']
        if pdf_file.filename == '':
            return {'error': 'No file selected'}, 400

        pdf_bytes = pdf_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        base = os.path.splitext(pdf_file.filename)[0]

        if len(doc) == 0:
            return {'error': 'Empty PDF'}, 400

        page = doc.load_page(0)
        pix = page.get_pixmap()

        img_bytes = io.BytesIO(pix.tobytes("png"))
        img_bytes.seek(0)

        return send_file(
            img_bytes,
            mimetype='image/png',
            as_attachment=True,
            download_name=f"{base}.png"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {'error': str(e)}, 500

@app.route('/convertWebP', methods=['POST'])
def convert_to_webp():
    if 'image' not in request.files:
        return {"error": "No image provided"}, 400

    file = request.files['image']

    try:
        # Open the PNG image
        img = Image.open(file)

        # Convert to WebP in memory
        webp_io = io.BytesIO()
        img.save(webp_io, format="WEBP")
        webp_io.seek(0)

        return send_file(
            webp_io,
            mimetype='image/webp',
            as_attachment=True,
            download_name='converted.webp'
        )

    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
