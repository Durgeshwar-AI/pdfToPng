from flask import Blueprint, request, send_file, jsonify
import fitz  # PyMuPDF
import io

split_pdf_bp = Blueprint("split_pdf", __name__)


@split_pdf_bp.route("/split-pdf", methods=["POST"])
def split_pdf():
    file = request.files.get("file")

    if not file or file.filename == "":
        return jsonify({"error": "No file provided."}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted."}), 400

    try:
        start_page = int(request.form.get("start_page", 1))
        end_page = int(request.form.get("end_page", 1))
    except (ValueError, TypeError):
        return jsonify({"error": "start_page and end_page must be valid integers."}), 400

    data = file.read()
    src = None
    output = None

    try:
        src = fitz.open(stream=data, filetype="pdf")
        total_pages = src.page_count

        if total_pages == 0:
            return jsonify({"error": "The uploaded PDF is empty."}), 400

        if start_page < 1 or end_page > total_pages or start_page > end_page:
            return jsonify({
                "error": (
                    f"Invalid page range. The PDF has {total_pages} page(s). "
                    f"start_page must be ≥ 1, end_page must be ≤ {total_pages}, "
                    f"and start_page must not exceed end_page."
                )
            }), 400

        # fitz uses 0-based page indices
        start_idx = start_page - 1
        end_idx = end_page - 1

        output = fitz.open()
        output.insert_pdf(src, from_page=start_idx, to_page=end_idx)

        buf = io.BytesIO()
        output.save(buf)
        buf.seek(0)

        base_name = file.filename.rsplit(".", 1)[0] or "document"
        download_name = f"{base_name}_pages_{start_page}-{end_page}.pdf"

        return send_file(
            buf,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name,
        )

    except fitz.FileDataError:
        return jsonify({"error": "The uploaded file appears to be corrupted or is not a valid PDF."}), 400

    finally:
        if src:
            src.close()
        if output:
            output.close()
