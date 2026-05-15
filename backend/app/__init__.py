from flask import Flask, request
import os
from flask_cors import CORS


def create_app():
    app = Flask(__name__)

    # Configure CORS. Use ALLOWED_ORIGINS env var if provided, otherwise allow all origins.
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
    # If ALLOWED_ORIGINS is wildcard, do not support credentials (browsers disallow wildcard with credentials).
    supports_credentials = False if allowed_origins.strip() == "*" else True
    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        expose_headers=["Content-Disposition", "Content-Type"],
        supports_credentials=supports_credentials,
    )

    # Also ensure CORS headers are present on all responses (fallback for error responses)
    @app.after_request
    def _add_cors_headers(response):
        # Echo the request origin if ALLOWED_ORIGINS is a specific origin or list.
        origin = request.headers.get("Origin")
        allowed_list = [o.strip() for o in allowed_origins.split(",") if o.strip()]

        if "Access-Control-Allow-Origin" not in response.headers:
            if "*" in allowed_list:
                response.headers["Access-Control-Allow-Origin"] = "*"
            elif origin and origin in allowed_list:
                response.headers["Access-Control-Allow-Origin"] = origin
            else:
                # Fallback to the first allowed origin string
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

    @app.route("/", methods=["GET", "HEAD"])
    def home():
        return {"message": "Server running"}, 200
    
    # Health check endpoint to verify server + CORS headers quickly
    @app.route("/health", methods=["GET", "OPTIONS"])
    def _health():
        return {"status": "ok"}, 200

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
