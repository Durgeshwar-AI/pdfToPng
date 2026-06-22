from flask import Blueprint, request, send_file
from PIL import Image, ImageDraw, ImageFont
import io
import os

watermark_bp = Blueprint('watermark', __name__)

@watermark_bp.route('/add-watermark', methods=['POST'])
def add_watermark():
    """
    Add text or image watermark to an image
    
    Expected form data:
    - image: image file
    - watermark_type: 'text' or 'image'
    - watermark_text: text for watermark (if type is 'text')
    - watermark_image: image file for watermark (if type is 'image')
    - position: 'top-left', 'top-center', 'top-right', 'center-left', 
               'center', 'center-right', 'bottom-left', 'bottom-center', 
               'bottom-right', 'tiled'
    - opacity: 0-100 (default: 70)
    - font_size: size in pixels (default: 40)
    - color: hex color for text (default: '#FFFFFF')
    - scale: scale percentage for image watermark (default: 20)
    """
    
    output = None
    img = None
    watermark_layer = None
    result_img = None
    
    try:
        # Validate inputs
        if 'image' not in request.files:
            return {'error': 'No image provided'}, 400
        
        watermark_type = request.form.get('watermark_type', 'text')
        if watermark_type not in ['text', 'image']:
            return {'error': 'Invalid watermark type'}, 400
        
        # Load main image
        image_file = request.files['image']
        img = Image.open(image_file).convert('RGBA')
        img_width, img_height = img.size
        
        opacity = int(request.form.get('opacity', 70))
        position = request.form.get('position', 'bottom-right')
        
        if watermark_type == 'text':
            # Text watermark
            watermark_text = request.form.get('watermark_text', 'Watermark')
            font_size = int(request.form.get('font_size', 40))
            color = request.form.get('color', '#FFFFFF')
            
            # Create watermark layer
            watermark_layer = create_text_watermark(
                watermark_text, font_size, color, opacity
            )
        else:
            # Image watermark
            if 'watermark_image' not in request.files:
                return {'error': 'No watermark image provided'}, 400
            
            watermark_file = request.files['watermark_image']
            scale = int(request.form.get('scale', 20))
            
            watermark_layer = create_image_watermark(
                watermark_file, scale, img_width, img_height, opacity
            )
        
        # Apply watermark
        if position == 'tiled':
            result_img = apply_tiled_watermark(img, watermark_layer)
        else:
            result_img = apply_positioned_watermark(
                img, watermark_layer, position
            )
        
        # Convert RGBA back to RGB for JPEG compatibility
        if result_img.mode == 'RGBA':
            background = Image.new('RGB', result_img.size, (255, 255, 255))
            background.paste(result_img, mask=result_img.split()[3])
            result_img = background
        
        # Save to bytes
        output = io.BytesIO()
        result_img.save(output, format='PNG', quality=95)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='image/png',
            as_attachment=True,
            download_name='watermarked.png'
        )
    
    except Exception as e:
        return {'error': str(e)}, 500
    
    finally:
        # Clean up buffer
        if output:
            try:
                output.close()
            except Exception:
                pass
        
        # Clean up images
        if img:
            try:
                img.close()
            except Exception:
                pass
        
        if watermark_layer and watermark_layer is not img:
            try:
                watermark_layer.close()
            except Exception:
                pass
        
        if result_img and result_img is not img and result_img is not watermark_layer:
            try:
                result_img.close()
            except Exception:
                pass
def create_text_watermark(text, font_size, color, opacity):
    """Create a text-based watermark layer"""
    try:
        # Use default font (works cross-platform)
        font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Create temporary image to measure text
    temp_img = Image.new('RGBA', (1, 1))
    temp_draw = ImageDraw.Draw(temp_img)
    bbox = temp_draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Create watermark layer
    watermark = Image.new(
        'RGBA',
        (text_width + 20, text_height + 20),
        (255, 255, 255, 0)
    )
    draw = ImageDraw.Draw(watermark)
    
    # Convert hex color to RGB
    try:
        color_rgb = tuple(int(color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    except:
        color_rgb = (255, 255, 255)  # Fallback to white
    
    alpha = int(255 * opacity / 100)
    
    draw.text((10, 10), text, font=font, fill=(*color_rgb, alpha))
    
    return watermark


def create_image_watermark(watermark_file, scale, img_width, img_height, opacity):
    """Create an image-based watermark layer"""
    watermark_img = Image.open(watermark_file).convert('RGBA')
    
    # Scale based on image size
    max_size = min(img_width, img_height) * scale // 100
    watermark_img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    
    # Apply opacity
    alpha = watermark_img.split()[3]
    alpha = alpha.point(lambda p: int(p * opacity / 100))
    watermark_img.putalpha(alpha)
    
    return watermark_img


def apply_positioned_watermark(base_img, watermark, position):
    img_width, img_height = base_img.size
    wm_width, wm_height = watermark.size

    if position == "diagonal-center":
        # Rotate watermark -45 degrees
        rotated = watermark.rotate(45, expand=True, resample=Image.Resampling.BICUBIC)
        rw, rh = rotated.size
        # Paste at center
        pos = ((img_width - rw) // 2, (img_height - rh) // 2)
        output = base_img.copy()
        output.paste(rotated, pos, rotated)
        return output

    positions = {
        'top-left': (10, 10),
        'top-center': ((img_width - wm_width) // 2, 10),
        'top-right': (img_width - wm_width - 10, 10),
        'center-left': (10, (img_height - wm_height) // 2),
        'center': ((img_width - wm_width) // 2, (img_height - wm_height) // 2),
        'center-right': (img_width - wm_width - 10, (img_height - wm_height) // 2),
        'bottom-left': (10, img_height - wm_height - 10),
        'bottom-center': ((img_width - wm_width) // 2, img_height - wm_height - 10),
        'bottom-right': (img_width - wm_width - 10, img_height - wm_height - 10),
    }

    pos = positions.get(position, positions['bottom-right'])
    output = base_img.copy()
    output.paste(watermark, pos, watermark)
    return output


def apply_tiled_watermark(base_img, watermark):
    """Apply watermark in a tiled pattern"""
    img_width, img_height = base_img.size
    wm_width, wm_height = watermark.size
    
    output = base_img.copy()
    
    # Tile the watermark across the image
    x = 0
    while x < img_width:
        y = 0
        while y < img_height:
            output.paste(watermark, (x, y), watermark)
            y += wm_height + 20  # Add spacing
        x += wm_width + 20
    
    return output