from app import create_app
from blueprints.pdf_extract_images import pdf_extract_images_bp
from blueprints.progress import progress_bp
import os

app = create_app()

# ✅ YAHAN PE REGISTER KARO (app create hone ke turant baad)
app.register_blueprint(pdf_extract_images_bp)

app.register_blueprint(progress_bp)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)