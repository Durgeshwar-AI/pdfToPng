import { useState, useRef, useCallback } from "react";

function ImageWbp() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setStatusMessage(
        `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`
      );
    } else if (selectedFile) {
      setStatusMessage(
        "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)"
      );
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropAreaRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleAreaClick = (e) => {
    if (
      e.target.tagName.toLowerCase() !== "label" &&
      !e.target.closest("label")
    ) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file first");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/convertWebP`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const disposition = response.headers.get("Content-Disposition");
        console.log("Content-Disposition:", disposition);
        let filename = file.name.replace(
          /\.(png|jpg|jpeg|gif|bmp|tiff|svg)$/i,
          ".webp"
        );
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatusMessage("Success! Your WebP file has been downloaded.");
        setTimeout(() => setStatusMessage(""), 5000);
      } else {
        const error = await response.json();
        setStatusMessage(`Error: ${error.error || "Conversion failed"}`);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to convert file"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Image to WebP Converter</h1>
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <div
          ref={dropAreaRef}
          className={`upload-area ${isDragging ? "dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          <div className="upload-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="image-input"
            ref={fileInputRef}
          />
          <label htmlFor="image-input">
            {file ? (
              <div className="file-selected" title={file.name}>
                {file.name.length > 25
                  ? `${file.name.substring(0, 22)}...`
                  : file.name}
              </div>
            ) : (
              <>
                Choose image file or drag & drop here
                <div className="drop-instructions">
                  Supports PNG, JPG, JPEG, GIF, BMP, and more
                </div>
              </>
            )}
          </label>
        </div>
        <button type="submit" disabled={!file || loading}>
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Converting...
            </>
          ) : (
            "Convert to WebP"
          )}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </form>
    </div>
  );
}

export default ImageWbp;
