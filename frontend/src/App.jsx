import { useState, useRef, useCallback } from "react";
import "./App.css";

function App() {
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
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setStatusMessage(
        `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`
      );
    } else if (selectedFile) {
      setStatusMessage("Error: Please select a PDF file");
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
    // Prevent triggering when clicking on the label which already has a htmlFor attribute
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
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/convert`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const disposition = response.headers.get("Content-Disposition");
        console.log("Content-Disposition:", disposition);
        let filename = file.name.replace(/\.pdf$/i, ".png");
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatusMessage("Success! Your PNG file has been downloaded.");
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
      <h1>PDF to PNG Converter</h1>
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
              <path
                d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 18V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 15L12 12L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            id="file-input"
            ref={fileInputRef}
          />
          <label htmlFor="file-input">
            {file ? (
              <div className="file-selected" title={file.name}>
                {file.name.length > 25
                  ? `${file.name.substring(0, 22)}...`
                  : file.name}
              </div>
            ) : (
              <>
                Choose PDF file or drag & drop here
                <div className="drop-instructions">
                  Click to browse or drop your PDF file
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
            "Convert to PNG"
          )}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </form>
    </div>
  );
}

export default App;
