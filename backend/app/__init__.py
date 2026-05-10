from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    CORS(app)

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
