import { useState, useRef, useCallback, useEffect } from "react";

function ImageWbp() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStatusMessage("");
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        if (selectedFile.type.startsWith("image/")) {
          const url = URL.createObjectURL(selectedFile);
          setPreviewUrl(url);
        } else {
          setPreviewUrl(null);
        }
        setStatusMessage(
          `File "${selectedFile.name}" selected (${(
            selectedFile.size / 1024
          ).toFixed(1)} KB)`
        );
      } else {
        setStatusMessage(
          "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)"
        );
        setTimeout(() => setStatusMessage(""), 3000);
      }
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
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image to WebP Converter
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <div
          ref={dropAreaRef}
          className={`w-full border-2 border-dashed rounded-2xl p-8 mb-8 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
            isDragging
              ? "border-[#3b82f6] bg-[#ebf5ff] scale-[1.02]"
              : "border-[#c7d2fe] bg-[rgba(239,246,255,0.6)] hover:border-[#4361ee] hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(67,97,238,0.1)] hover:bg-[rgba(229,240,255,0.8)] active:translate-y-0 active:shadow-[0_4px_8px_rgba(67,97,238,0.08)] active:bg-[rgba(219,234,254,0.9)]"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="image-input"
            ref={fileInputRef}
            className="hidden"
          />
          <label
            htmlFor="image-input"
            className="flex flex-col items-center text-xl text-[#4b5563] cursor-pointer font-medium transition-colors duration-200 hover:text-[#1a1a2e] w-full"
          >
            {file ? (
              <div className="relative group w-full flex flex-col items-center">
                <div className="relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 max-w-full rounded-lg shadow-md object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-4">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-red-500"
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
                        <text
                          x="12"
                          y="17"
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize="6"
                          fontWeight="bold"
                          style={{ fontSize: "5px" }}
                        >
                          PDF
                        </text>
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={handleClear}
                    className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Remove file"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div
                  className="bg-[#f0f9ff] px-4 py-2 rounded-lg mt-4 text-[#0369a1] font-semibold shadow-[0_2px_5px_rgba(0,0,0,0.05)] border-l-[3px] border-[#0ea5e9] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  title={file.name}
                >
                  {file.name.length > 30
                    ? `${file.name.substring(0, 27)}...`
                    : file.name}
                </div>
              </div>
            ) : (
              <>
                <div className="text-[2.5rem] text-[#4361ee] mb-4">
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
                Choose image file or drag & drop here
                <div className="text-[0.95rem] text-[#6b7280] mt-3">
                  Supports PNG, JPG, JPEG, GIF, BMP, and more
                </div>
              </>
            )}
          </label>
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Converting...
            </>
          ) : (
            "Convert to WebP"
          )}
        </button>
        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>
    </div>
  );
}

export default ImageWbp;
