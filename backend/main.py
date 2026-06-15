from app import create_app
from blueprints.health import health_bp
from blueprints.pdf_extract_images import pdf_extract_images_bp
import os

app = create_app()

app.register_blueprint(pdf_extract_images_bp)
app.register_blueprint(health_bp)
if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)