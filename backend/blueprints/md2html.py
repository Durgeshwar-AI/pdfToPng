#!/usr/bin/env python3
"""
Markdown to HTML converter with built-in CSS themes.
Usage:
    python md2html.py input.md [-o output.html] [-t theme_name]
    python md2html.py input.md --theme dark
"""

import argparse
import os
import sys

try:
    import markdown2
except ImportError:
    markdown2 = None

# Predefined themes as CSS strings
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
    color: #f8f9f2;
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
    color: #f8f9f2;
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

    html_content = markdown2.markdown(md_text, extras=["fenced-code-blocks", "tables"])
    theme_css = THEMES.get(theme_name, THEMES["light"])
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert Markdown to HTML with built-in CSS themes.")
    parser.add_argument("input", help="Input Markdown file")
    parser.add_argument("-o", "--output", help="Output HTML file (default: input file with .html extension)")
    parser.add_argument("-t", "--theme", choices=THEMES.keys(), default="light",
                        help="Theme to use (default: light)")

    args = parser.parse_args()

    if markdown2 is None:
        print("Error: markdown2 module is required. Install it with: pip install markdown2")
        sys.exit(1)

    if not os.path.isfile(args.input):
        print(f"Error: Input file '{args.input}' not found.")
        sys.exit(1)

    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except Exception as e:
        print(f"Error reading input file: {e}")
        sys.exit(1)

    html_output = convert_md_to_html(md_content, args.theme)

    if args.output:
        output_file = args.output
    else:
        output_file = os.path.splitext(args.input)[0] + ".html"

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_output)
        print(f"Conversion complete: {args.input} -> {output_file} (theme: {args.theme})")
    except Exception as e:
        print(f"Error writing output file: {e}")
        sys.exit(1)
