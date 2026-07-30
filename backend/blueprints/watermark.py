from flask import Blueprint, request, send_file
from PIL import Image, ImageDraw, ImageFont
from utils.helpers import error
import io
import os

watermark_bp = Blueprint('watermark', __name__)

@watermark_bp.route('/add-watermark', methods=['POST'])
def add_watermark():
    if 'image' not in request.files:
        return error('No image file provided', 400)

    file = request.files['image']
    if file.filename == '':
        return error('No selected file', 400)

    try:
        img = Image.open(file).convert('RGBA')
    except Exception:
        return error('Invalid image file provided', 400)

    img_width, img_height = img.size
    watermark_type = request.form.get('watermark_type', 'text')

    try:
        opacity = int(request.form.get('opacity', 70))
    except (ValueError, TypeError):
        opacity = 70

    position = request.form.get('position', 'bottom-right')

    try:
        size = int(request.form.get('size', 30))
    except (ValueError, TypeError):
        size = 30

    if watermark_type == 'text':
        watermark_text = request.form.get('watermark_text', 'Watermark')
        color = request.form.get('color', '#FFFFFF')

        font_size = max(10, int(img_height * size / 500))

        watermark_layer = create_text_watermark(
            watermark_text, font_size, color, opacity
        )
    else:
        if 'watermark_image' not in request.files:
            return error('No watermark image provided', 400)

        watermark_file = request.files['watermark_image']

        watermark_layer = create_image_watermark(
            watermark_file, size, img_width, img_height, opacity
        )

    if position == 'tiled':
        result_img = apply_tiled_watermark(img, watermark_layer)
    else:
        result_img = apply_positioned_watermark(img, watermark_layer, position)

    img_byte_arr = io.BytesIO()
    result_img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    return send_file(
        img_byte_arr,
        mimetype='image/png',
        as_attachment=True,
        download_name='watermarked.png'
    )


def create_text_watermark(text, font_size, color, opacity):
    """Create a text-based watermark layer"""
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
    except Exception:
        try:
            font = ImageFont.load_default(size=font_size)  # Pillow >= 10.1
        except TypeError:
            font = ImageFont.load_default()

    temp_img = Image.new('RGBA', (1, 1))
    temp_draw = ImageDraw.Draw(temp_img)
    bbox = temp_draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    watermark = Image.new(
        'RGBA',
        (text_width + 20, text_height + 20),
        (255, 255, 255, 0)
    )
    draw = ImageDraw.Draw(watermark)

    try:
        color_rgb = tuple(int(color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    except:
        color_rgb = (255, 255, 255)

    alpha = int(255 * opacity / 100)
    draw.text((10, 10), text, font=font, fill=(*color_rgb, alpha))

    return watermark


def create_image_watermark(watermark_file, size, img_width, img_height, opacity):  # CHANGED: param renamed scale -> size
    """Create an image-based watermark layer"""
    watermark_img = Image.open(watermark_file).convert('RGBA')

    max_size = min(img_width, img_height) * size // 100
    watermark_img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    alpha = watermark_img.split()[3]
    alpha = alpha.point(lambda p: int(p * opacity / 100))
    watermark_img.putalpha(alpha)

    return watermark_img

def apply_positioned_watermark(base_img, watermark, position):
    img_width, img_height = base_img.size
    wm_width, wm_height = watermark.size

    if position == "diagonal-center":
        rotated = watermark.rotate(45, expand=True, resample=Image.Resampling.BICUBIC)
        rw, rh = rotated.size
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

    x = 0
    while x < img_width:
        y = 0
        while y < img_height:
            output.paste(watermark, (x, y), watermark)
            y += wm_height + 20  
        x += wm_width + 20

    return output
