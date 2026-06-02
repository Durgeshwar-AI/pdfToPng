import traceback
from io import BytesIO

from flask import Blueprint, request

from utils.helpers import error, send_file_and_cleanup
from .md2html import convert_md_to_html, THEMES, markdown2

markdown_bp = Blueprint("markdown", __name__)

# Themes and converter are imported from md2html.py, keeping shared logic in one place

THEMES = {
    "light": """
/* Light Theme */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
}
h1, h2, h3, h4, h5, h6 {
    color: #2c3e50;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}
h1 { font-size: 2.2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
h2 { font-size: 1.8em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
h3 { font-size: 1.5em; }
p {
    margin-bottom: 1em;
}
a {
    color: #3498db;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
blockquote {
    border-left: 4px solid #ddd;
    margin: 1.5em 0;
    padding: 0.5em 1em;
    color: #666;
    background-color: #f9f9f9;
}
code {
    background-color: #f8f9fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
}
pre {
    background-color: #f8f9fa;
    padding: 1em;
    overflow-x: auto;
    border-radius: 5px;
}
pre code {
    background: none;
    padding: 0;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5em 0;
}
th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #f2f2f2;
}
tr:nth-child(even) {
    background-color: #f9f9f9;
}
ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
}
li {
    margin-bottom: 0.3em;
}
hr {
    border: 0;
    border-top: 1px solid #eee;
    margin: 2em 0;
}
img {
    max-width: 100%;
    height: auto;
}
""",
    "dark": """
/* Dark Theme */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #eee;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #121212;
}
h1, h2, h3, h4, h5, h6 {
    color: #fff;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}
h1 { font-size: 2.2em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
h2 { font-size: 1.8em; border-bottom: 1px solid #333; padding-bottom: 0.2em; }
h3 { font-size: 1.5em; }
p {
    margin-bottom: 1em;
}
a {
    color: #64b5f6;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
blockquote {
    border-left: 4px solid #444;
    margin: 1.5em 0;
    padding: 0.5em 1em;
    color: #bbb;
    background-color: #1e1e1e;
}
code {
    background-color: #1e1e1e;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    color: #f8f8f2;
}
pre {
    background-color: #1e1e1e;
    padding: 1em;
    overflow-x: auto;
    border-radius: 5px;
    border: 1px solid #333;
}
pre code {
    background: none;
    padding: 0;
    color: #f8f8f2;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5em 0;
}
th, td {
    border: 1px solid #444;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #1e1e1e;
}
tr:nth-child(even) {
    background-color: #1a1a1a;
}
ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
}
li {
    margin-bottom: 0.3em;
}
hr {
    border: 0;
    border-top: 1px solid #333;
    margin: 2em 0;
}
img {
    max-width: 100%;
    height: auto;
}
""",
    "blue": """
/* Blue Theme */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #2c3e50;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ecf0f1;
}
h1, h2, h3, h4, h5, h6 {
    color: #1a5276;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}
h1 { font-size: 2.2em; border-bottom: 2px solid #aed6f1; padding-bottom: 0.3em; }
h2 { font-size: 1.8em; border-bottom: 1px solid #aed6f1; padding-bottom: 0.2em; }
h3 { font-size: 1.5em; }
p {
    margin-bottom: 1em;
}
a {
    color: #154360;
    text-decoration: none;
}
a:hover {
    text-decoration: underline;
}
blockquote {
    border-left: 4px solid #aed6f1;
    margin: 1.5em 0;
    padding: 0.5em 1em;
    color: #566573;
    background-color: #d6eaf8;
}
code {
    background-color: #d6eaf8;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
}
pre {
    background-color: #d6eaf8;
    padding: 1em;
    overflow-x: auto;
    border-radius: 5px;
    border: 1px solid #aed6f1;
}
pre code {
    background: none;
    padding: 0;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5em 0;
}
th, td {
    border: 1px solid #aed6f1;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #aed6f1;
}
tr:nth-child(even) {
    background-color: #ebf5fb;
}
ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
}
li {
    margin-bottom: 0.3em;
}
hr {
    border: 0;
    border-top: 1px solid #aed6f1;
    margin: 2em 0;
}
img {
    max-width: 100%;
    height: auto;
}
"""
}


def convert_md_to_html(md_text, theme_name="light"):
    """Convert Markdown text to HTML with embedded CSS theme."""
    if markdown2 is None:
        raise RuntimeError("markdown2 module is not installed")

    # Convert markdown to HTML
    html_content = markdown2.markdown(md_text, extras=["fenced-code-blocks", "tables"])

    # Get theme CSS
    theme_css = THEMES.get(theme_name, THEMES["light"])

    # Create full HTML document
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
{theme_css}
    </style>
</head>
<body>
{html_content}
</body>
</html>"""
    return full_html


@markdown_bp.route("/convertMdToHtml", methods=["POST"])
def convert_md_to_html_endpoint():
    if markdown2 is None:
        return error("markdown2 dependency is not installed on the server", 500)

    doc = None
    try:
        if "file" not in request.files:
            return error("No file provided")

        md_file = request.files["file"]

        if md_file.filename == "":
            return error("No file selected")

        # Optional: check if the file is a Markdown file by extension
        if not md_file.filename.lower().endswith(".md"):
            return error("Invalid file format. Please upload a Markdown (.md) file.")

        # Read the Markdown content
        md_content = md_file.read().decode("utf-8")

        # Get optional parameters
        output_filename = request.form.get("output_filename", "")
        theme = request.form.get("theme", "light")

        # Validate theme
        if theme not in THEMES:
            theme = "light"

        # Convert to HTML
        html_output = convert_md_to_html(md_content, theme)

        # Determine output filename
        if not output_filename:
            # Remove .md extension and add .html
            base = md_file.filename.rsplit(".", 1)[0] if md_file.filename.lower().endswith(".md") else md_file.filename
            output_filename = base + ".html"
        elif not output_filename.lower().endswith(".html"):
            output_filename += ".html"

        # Return the HTML as a downloadable file
        return send_file_and_cleanup(
            BytesIO(html_output.encode("utf-8")),
            mimetype="text/html",
            as_attachment=True,
            download_name=output_filename,
        )

    except UnicodeDecodeError:
        return error("Could not decode the file as UTF-8. Please ensure it is a valid Markdown file.")
    except Exception as e:
        # Log the error for debugging (optional)
        # traceback.print_exc()
        return error("An error occurred during Markdown to HTML conversion.")