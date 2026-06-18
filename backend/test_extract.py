import fitz  # PyMuPDF
import io
import zipfile
import os

def test_extract(pdf_path):
    """Test PDF image extraction without Flask"""
    
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return
    
    # Read PDF
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    # Open PDF from memory
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    print(f"✅ PDF opened: {pdf_path}")
    print(f"📄 Total pages: {len(doc)}")
    
    total_images = 0
    
    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            
            print(f"  Page {page_num + 1}: {len(image_list)} images found")
            
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
                    
                    img_filename = f"page{page_num+1}_img{img_index+1}.{ext}"
                    zip_file.writestr(img_filename, img_data)
                    total_images += 1
                    
                    print(f"    ✅ Extracted: {img_filename}")
                    
                except Exception as e:
                    print(f"    ❌ Error: {e}")
        
        doc.close()
        
        # Add report
        report = f"Extracted {total_images} images from {pdf_path}"
        zip_file.writestr("report.txt", report)
    
    if total_images > 0:
        # Save ZIP file
        zip_buffer.seek(0)
        with open("extracted_images.zip", "wb") as f:
            f.write(zip_buffer.read())
        print(f"\n✅ ZIP created: extracted_images.zip ({total_images} images)")
    else:
        print("\n⚠️ No images found in PDF")

if __name__ == "__main__":
    # Ask for PDF path
    pdf_input = input("Enter PDF path (or drag-drop PDF here): ").strip().strip('"')
    test_extract(pdf_input)