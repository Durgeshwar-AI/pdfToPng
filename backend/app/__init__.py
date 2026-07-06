from flask import Flask, request
import os
import logging
from flask_cors import CORS

logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)

    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")

    supports_credentials = False if allowed_origins.strip() == "*" else True
    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        expose_headers=["Content-Disposition", "Content-Type"],
        supports_credentials=supports_credentials,
    )

    @app.after_request
    def _add_cors_headers(response):

        origin = request.headers.get("Origin")
        allowed_list = [o.strip()
                        for o in allowed_origins.split(",") if o.strip()]
        if "Access-Control-Allow-Origin" not in response.headers:
            if "*" in allowed_list:
                response.headers["Access-Control-Allow-Origin"] = "*"
            elif origin and origin in allowed_list:
                response.headers["Access-Control-Allow-Origin"] = origin
            else:

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

    @app.after_request
    def _add_security_headers(response):
        # X-Content-Type-Options: stops browsers from MIME-sniffing a
        # response away from the declared Content-Type, which matters here
        # since converted files are served back to the browser.
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        # X-Frame-Options: prevents this API's responses (and any HTML error
        # pages) from being embedded in a third-party iframe for clickjacking.
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault(
            "Referrer-Policy", "strict-origin-when-cross-origin"
        )
        response.headers.setdefault(
            "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
        )
        return response

    @app.route("/", methods=["GET", "HEAD"])
    def home():
        return {"message": "Server running"}, 200

    # Health check endpoint to verify server + CORS headers quickly
    @app.route("/health", methods=["GET", "OPTIONS"])
    def _health():
        return {"status": "ok"}, 200

    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    from blueprints.pdf import pdf_bp
    from blueprints.pdf_to_docx import pdf_docx_bp
    from blueprints.docx_to_pdf import docx_pdf_bp
    from blueprints.image import image_bp
    from blueprints.removebg import remove_bp
    from blueprints.rotate_flip import rotate_flip_bp
    from blueprints.dpi_converter import dpi_bp
    from blueprints.metadata_viewer import metadata_bp
    from blueprints.merge_pdf import merge_pdf_bp
    from blueprints.watermark import watermark_bp
    from blueprints.sign import sign_bp
    from blueprints.markdown import markdown_bp
    from blueprints.markdown_docx import markdown_docx_bp
    from blueprints.pdf_info import pdf_info_bp
    from blueprints.compress_pdf import compress_pdf_bp
    from blueprints.protect_pdf import protect_pdf_bp
    from blueprints.unlock_pdf import unlock_pdf_bp
    from blueprints.pptx_to_pdf import pptx_pdf_bp

    app.register_blueprint(pdf_bp)
    app.register_blueprint(pdf_docx_bp)
    app.register_blueprint(docx_pdf_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(remove_bp)
    app.register_blueprint(rotate_flip_bp)  # Corrected blueprint name
    app.register_blueprint(dpi_bp)
    app.register_blueprint(metadata_bp)
    app.register_blueprint(merge_pdf_bp)
    app.register_blueprint(watermark_bp)
    app.register_blueprint(sign_bp)
    app.register_blueprint(markdown_bp)
    app.register_blueprint(markdown_docx_bp)
    app.register_blueprint(pdf_info_bp)
    app.register_blueprint(compress_pdf_bp)
    app.register_blueprint(protect_pdf_bp)
    app.register_blueprint(unlock_pdf_bp)
    app.register_blueprint(pptx_pdf_bp)

    # Initialize background scheduler for cleanup jobs
    try:
        from utils.scheduler import init_scheduler
        init_scheduler()
    except ImportError:
        logger.warning("APScheduler not installed. Cleanup jobs will not run automatically.")
    except Exception as e:
        logger.error(f"Failed to initialize scheduler: {e}")

    return app
