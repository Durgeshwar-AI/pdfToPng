from flask import Flask
import os
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    # Configure CORS. Use ALLOWED_ORIGINS env var if provided, otherwise allow all origins.
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        expose_headers=["Content-Disposition", "Content-Type"],
        supports_credentials=True,
    )

    # Also ensure CORS headers are present on all responses (fallback for error responses)
    @app.after_request
    def _add_cors_headers(response):
        if "Access-Control-Allow-Origin" not in response.headers:
            response.headers["Access-Control-Allow-Origin"] = allowed_origins
        if "Access-Control-Allow-Headers" not in response.headers:
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type,Authorization,Accept,Origin"
            )
        if "Access-Control-Allow-Methods" not in response.headers:
            response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        if "Access-Control-Expose-Headers" not in response.headers:
            response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response

    # 10 MB hard limit
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    # Register blueprints (import here to avoid circular imports)
    from blueprints.pdf import pdf_bp
    from blueprints.image import image_bp
    from blueprints.removebg import remove_bp

    app.register_blueprint(pdf_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(remove_bp)

    return app
