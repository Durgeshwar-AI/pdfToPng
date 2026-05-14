import React, { useCallback, useRef, useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfPng = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scale, setScale] = useState(2.0); // Default scale (2x)
  const [pageMode, setPageMode] = useState("all"); // all, single, range
  const [pageRange, setPageRange] = useState("");
  const [numPages, setNumPages] = useState(0);
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

  const processFile = async (selectedFile) => {
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type.startsWith("image/")
      ) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith("image/")) {
          const url = URL.createObjectURL(selectedFile);
          setPreviewUrl(url);
          setNumPages(0);
        } else {
          setPreviewUrl(null);
          // Load PDF to get total pages
          try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setNumPages(pdf.numPages);
          } catch (err) {
            console.error("Error loading PDF info:", err);
          }
        }
        setStatusMessage(
          `File "${selectedFile.name}" selected (${(
            selectedFile.size / 1024
          ).toFixed(1)} KB)`
        );
      } else {
        setStatusMessage("Error: Please select a PDF file");
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
    setStatusMessage("Processing PDF... This may take a while for large files.");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let pagesToRender = [];
      if (pageMode === "all") {
        pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else if (pageMode === "single") {
        pagesToRender = [1];
      } else if (pageMode === "range") {
        const ranges = pageRange.split(",").map((r) => r.trim());
        ranges.forEach((r) => {
          if (r.includes("-")) {
            const [start, end] = r.split("-").map(Number);
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToRender.push(i);
            }
          } else {
            const num = Number(r);
            if (num >= 1 && num <= totalPages) pagesToRender.push(num);
          }
        });
      }

      // Deduplicate and sort
      pagesToRender = [...new Set(pagesToRender)].sort((a, b) => a - b);

      if (pagesToRender.length === 0) {
        throw new Error("No valid pages selected");
      }

      const zip = new JSZip();
      const results = [];

      for (let i = 0; i < pagesToRender.length; i++) {
        const pageNum = pagesToRender[i];
        setStatusMessage(`Rendering page ${pageNum} (${i + 1}/${pagesToRender.length})...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        results.push({ name: `page-${pageNum}.png`, blob });
      }

      if (results.length === 1) {
        const url = window.URL.createObjectURL(results[0].blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, ".png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setStatusMessage("Success! Your PNG file has been downloaded.");
      } else {
        setStatusMessage("Packaging files into ZIP...");
        results.forEach((res) => zip.file(res.name, res.blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(/\.pdf$/i, "")}_pages.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setStatusMessage(`Success! ZIP file with ${results.length} pages downloaded.`);
      }

      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error) {
      console.error(error);
      setStatusMessage(`Error: ${error.message || "Failed to convert file"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        PDF to PNG Converter
      </h1>
      <p className="mt-4 mb-6 text-[0.95rem] text-[#6b7280]">Use it for single page pdf only</p>
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
            accept=".pdf"
            onChange={handleFileChange}
            id="file-input"
            ref={fileInputRef}
            className="hidden"
          />
          <label
            htmlFor="file-input"
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
                Choose PDF file or drag & drop here
                <div className="text-[0.95rem] text-[#6b7280] mt-3">
                  Click to browse or drop your PDF file
                </div>
              </>
            )}
          </label>
        </div>

        {file && (
          <div className="w-full space-y-6 mb-8 text-left bg-white/50 p-6 rounded-xl border border-[#c7d2fe] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Quality Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
                  Quality / DPI
                </label>
                <span className="bg-[#4361ee] text-white text-xs px-2 py-1 rounded font-bold">
                  {scale.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#e2e8f0] rounded-lg appearance-none cursor-pointer accent-[#4361ee] transition-all hover:bg-[#cbd5e1]"
              />
              <div className="flex justify-between text-[10px] text-[#6b7280] font-medium">
                <span>Standard (1x)</span>
                <span>High (3x)</span>
                <span>Ultra (5x)</span>
              </div>
            </div>

            {/* Page Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
                Page Selection {numPages > 0 && `(Total: ${numPages})`}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["all", "single", "range"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPageMode(mode)}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      pageMode === mode
                        ? "bg-[#4361ee] text-white shadow-[0_4px_10px_rgba(67,97,238,0.3)] scale-[1.02]"
                        : "bg-white text-[#4b5563] border border-[#e2e8f0] hover:border-[#4361ee] hover:text-[#4361ee]"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {pageMode === "range" && (
                <div className="animate-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    placeholder="e.g. 1-3, 5"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    className="w-full p-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4361ee]/10 focus:border-[#4361ee] transition-all bg-white placeholder:text-[#94a3b8] text-[#1a1a2e] font-medium"
                  />
                  <p className="mt-2 text-[11px] text-[#6b7280]">
                    Enter page numbers or ranges separated by commas
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
            "Convert to PNG"
          )}
        </button>
        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>
    </div>
  );
};

export default PdfPng;
