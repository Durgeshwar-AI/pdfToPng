import { useState, useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";

function ImageMetadata() {
  const [metadata, setMetadata] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [stripping, setStripping] = useState(false);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select an image file (JPEG, PNG, TIFF, BMP, WebP)",
    };
  }, []);

  const {
    file,
    loading,
    setLoading,
    isDragging,
    statusMessage,
    setStatusMessage,
    previewUrl,
    fileInputRef,
    dropAreaRef,
    handleFileChange,
    handleClear,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAreaClick,
  } = useFileUpload(validateFile);

  const handleClearAll = (e) => {
    handleClear(e);
    setMetadata(null);
    setCopiedKey(null);
  };

  // ── View Metadata ──────────────────────────────────────────────────────────
  const handleViewMetadata = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file first");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    setMetadata(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/view-metadata`,
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(`Error: ${data.error || "Failed to read metadata"}`);
        setTimeout(() => setStatusMessage(""), 5000);
        return;
      }

      if (data.message) {
        setStatusMessage(data.message);
        setTimeout(() => setStatusMessage(""), 4000);
        return;
      }

      setMetadata(data.metadata);
      setStatusMessage("");
    } catch (err) {
      setStatusMessage(`Error: ${err.message || "Failed to read metadata"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ── Copy to Clipboard ──────────────────────────────────────────────────────
  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleCopyAll = async () => {
    if (!metadata) return;
    const text = Object.entries(metadata)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey("__all__");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  // ── Strip Metadata ─────────────────────────────────────────────────────────
  const handleStrip = async () => {
    if (!file) return;
    setStripping(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/strip-metadata`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const data = await response.json();
        setStatusMessage(`Error: ${data.error || "Failed to strip metadata"}`);
        setTimeout(() => setStatusMessage(""), 5000);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = file.name.match(/\.[^.]+$/)?.[0] || ".jpg";
      a.download = `${file.name.replace(/\.[^.]+$/, "")}_stripped${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setStatusMessage("Success! Clean image without metadata downloaded.");
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err) {
      setStatusMessage(`Error: ${err.message || "Failed to strip metadata"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setStripping(false);
    }
  };

  const metadataEntries = metadata ? Object.entries(metadata) : [];

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">

      {/* Title */}
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image Metadata Viewer
      </h1>

      <form onSubmit={handleViewMetadata} className="w-full flex flex-col items-center">

        {/* Upload Area */}
        <FileUploadArea
          file={file}
          previewUrl={previewUrl}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={handleClearAll}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept="image/*"
          inputId="metadata-input"
          defaultIcon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
          defaultText="Choose image file or drag & drop here"
          supportText="Full EXIF support for JPEG, TIFF | Basic info for PNG, WebP, BMP"
        />

        {/* View Metadata button */}
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Reading...
            </>
          ) : (
            "View Metadata"
          )}
        </button>

        {/* Status message */}
        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>

      {/* Metadata Table */}
      {metadataEntries.length > 0 && (
        <div className="w-full mt-8">

          {/* Table header with Copy All button */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a1a2e]">
              {metadataEntries.length} fields found
            </p>
            <button
              onClick={handleCopyAll}
              className="text-sm px-3 py-1.5 rounded-lg border border-[#c7d2fe] text-[#4361ee] bg-white hover:bg-[#eef2ff] transition-all duration-200 font-medium"
            >
              {copiedKey === "__all__" ? "✓ Copied All" : "Copy All"}
            </button>
          </div>

          {/* Rows */}
          <div className="w-full flex flex-col gap-2 text-left">
            {metadataEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-[#f0f9ff] border-l-[3px] border-[#0ea5e9] px-4 py-2.5 rounded-lg shadow-[0_2px_5px_rgba(0,0,0,0.04)]"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-0.5">
                    {key}
                  </p>
                  <p className="text-sm text-[#1a1a2e] font-medium truncate" title={String(value)}>
                    {String(value)}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(key, value)}
                  className="flex-shrink-0 text-xs px-2.5 py-1 rounded-md border border-[#c7d2fe] text-[#4361ee] bg-white hover:bg-[#eef2ff] transition-all duration-200 font-medium"
                >
                  {copiedKey === key ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>

          {/* Strip metadata button */}
          <button
            onClick={handleStrip}
            disabled={stripping}
            className="mt-6 w-full py-3.5 px-8 rounded-lg border-2 border-red-400 text-red-500 bg-white font-semibold text-base transition-all duration-300 hover:enabled:bg-red-50 hover:enabled:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stripping ? (
              <>
                <span className="inline-block w-4 h-4 border-[3px] border-red-200 rounded-full border-t-red-500 animate-spin mr-2"></span>
                Stripping...
              </>
            ) : (
              "Strip Metadata & Download"
            )}
          </button>

          {/* Info note */}
          <p className="mt-4 text-xs text-[#6b7280] text-center">
            Strip removes all hidden metadata and downloads a clean copy of your image.
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageMetadata;