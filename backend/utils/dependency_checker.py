from shutil import which


def _tool_status(name, binary_names, required_for, install_command, optional=False):
    installed = any(which(binary) for binary in binary_names)
    return {
        "installed": installed,
        "required_for": required_for,
        "install_command": install_command,
        "optional": optional,
        "binary_names": binary_names,
    }


def check_dependency_status():
    dependencies = {
        "poppler-utils": _tool_status(
            "poppler-utils",
            ["pdfinfo", "pdftoppm"],
            ["PDF to PNG", "PDF info", "PDF merge validation"],
            "apt-get install poppler-utils",
        ),
        "tesseract-ocr": _tool_status(
            "tesseract-ocr",
            ["tesseract"],
            ["Image OCR"],
            "apt-get install tesseract-ocr",
        ),
        "ghostscript": _tool_status(
            "ghostscript",
            ["gs"],
            ["PDF compression", "PDF post-processing"],
            "apt-get install ghostscript",
            optional=True,
        ),
    }

    required_missing = [
        name for name, data in dependencies.items() if not data["optional"] and not data["installed"]
    ]

    return {
        "status": "degraded" if required_missing else "ok",
        "dependencies": dependencies,
        "missing_required_dependencies": required_missing,
    }
