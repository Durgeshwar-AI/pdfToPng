import base64
from io import BytesIO
import subprocess
import sys
from zipfile import ZipFile


def _read_docx_parts(markdown):
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            (
                "import base64, sys; "
                "from blueprints.markdown_docx import _convert; "
                "print(base64.b64encode(_convert(sys.stdin.read()).getvalue()).decode())"
            ),
        ],
        input=markdown,
        text=True,
        capture_output=True,
        check=True,
    )
    document = ZipFile(BytesIO(base64.b64decode(result.stdout)))
    return (
        document.read("word/document.xml"),
        document.read("word/_rels/document.xml.rels"),
    )


def test_markdown_links_create_external_docx_relationships():
    document_xml, relationships_xml = _read_docx_parts(
        "[Project documentation](https://example.com/docs)"
    )

    assert b"<w:hyperlink" in document_xml
    assert b"Project documentation" in document_xml
    assert b'Target="https://example.com/docs"' in relationships_xml
    assert b'TargetMode="External"' in relationships_xml


def test_markdown_links_are_preserved_in_lists_and_multiple_paragraphs():
    document_xml, relationships_xml = _read_docx_parts(
        "[First](https://example.com/first) and [second](https://example.com/second)\n\n"
        "- [List item](https://example.com/list)"
    )

    assert document_xml.count(b"<w:hyperlink") == 3
    for target in (
        b"https://example.com/first",
        b"https://example.com/second",
        b"https://example.com/list",
    ):
        assert target in relationships_xml


def test_invalid_link_targets_remain_plain_styled_text():
    document_xml, relationships_xml = _read_docx_parts(
        "[Unsafe link](javascript:alert(1))"
    )

    assert b"Unsafe link" in document_xml
    assert b"<w:hyperlink" not in document_xml
    assert b"javascript:" not in relationships_xml
