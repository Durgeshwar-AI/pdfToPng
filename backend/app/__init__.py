from flask import Flask, request
import os
from flask_cors import CORS

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
        allowed_list = [o.strip() for o in allowed_origins.split(",") if o.strip()]
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

    @app.route("/", methods=["GET", "HEAD"])
    def home():
        return {"message": "Server running"}, 200
    
    # Health check endpoint to verify server + CORS headers quickly
    @app.route("/health", methods=["GET", "OPTIONS"])
    def _health():
        return {"status": "ok"}, 200
    
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
    
    from blueprints.pdf import pdf_bp
    from blueprints.image import image_bp
    from blueprints.removebg import remove_bp
    from blueprints.rotate_flip import rotate_flip_bp
    app.register_blueprint(pdf_bp)
    app.register_blueprint(image_bp)
    app.register_blueprint(remove_bp)
    app.register_blueprint(rotate_flip_bp)
    return app
