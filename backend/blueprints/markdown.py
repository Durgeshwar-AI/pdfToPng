from io import BytesIO

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup
from .md2html import convert_md_to_html, THEMES, markdown2

markdown_bp = Blueprint("markdown", __name__)


@markdown_bp.route("/convertMdToHtml", methods=["POST"])
def convert_md_to_html_endpoint():
    if markdown2 is None:
        return error("markdown2 dependency is not installed on the server", 500)

    try:
        if "file" not in request.files:
            return error("No file provided")

        md_file = request.files["file"]

        if md_file.filename == "":
            return error("No file selected")

        if not md_file.filename.lower().endswith(".md"):
            return error("Invalid file format. Please upload a Markdown (.md) file.")

        md_content = md_file.read().decode("utf-8")

        output_filename = request.form.get("output_filename", "")
        theme = request.form.get("theme", "light")

        if theme not in THEMES:
            theme = "light"

        html_output = convert_md_to_html(md_content, theme)

        if not output_filename:
            base = md_file.filename.rsplit(".", 1)[0]
            output_filename = base + ".html"
        elif not output_filename.lower().endswith(".html"):
            output_filename += ".html"

        return send_file_and_cleanup(
            BytesIO(html_output.encode("utf-8")),
            mimetype="text/html",
            as_attachment=True,
            download_name=output_filename,
        )

    except UnicodeDecodeError:
        return error("Could not decode the file as UTF-8. Please ensure it is a valid Markdown file.")
    except Exception:
        return error("An error occurred during Markdown to HTML conversion.")