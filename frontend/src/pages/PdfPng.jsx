import React, { useCallback, useState, useRef } from "react";
import JSZip from "jszip";
import ToolPageTemplate from "../components/ToolPageTemplate";
import MultiFileResults from "../components/MultiFileResults";
import useSSE from "../hooks/useSSE";
import ProgressBar from "../components/ProgressBar";
import axios from "axios";

// Set worker source for PDF.js
const PdfPng = () => {
  const [scale, setScale] = useState(2.0);
  const [pageMode, setPageMode] = useState("all");
  const [pageRange, setPageRange] = useState("");
  const [singlePage, setSinglePage] = useState("1");
  const [numPages, setNumPages] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [outputFiles, setOutputFiles] = useState([]);
  
  // SSE Progress States
  const [isProcessing, setIsProcessing] = useState(false);
  const [sseUrl, setSseUrl] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const currentFileRef = useRef(null);

  // SSE Hook for real-time progress
  const { progress, isConnected, error: sseError } = useSSE(sseUrl, {
    autoConnect: !!sseUrl,
    onComplete: async (data) => {
      setIsProcessing(false);
      setSseUrl(null);
      
      // If we have a download URL from the server
      if (data.message && data.message.includes('/download/')) {
        window.location.href = data.message;
      } else if (currentFileRef.current) {
        // Fallback: Use client-side conversion if server didn't provide file
        await performClientConversion(currentFileRef.current);
      }
    },
    onError: (err) => {
      console.error('SSE Error:', err);
      setIsProcessing(false);
      setSseUrl(null);
      // Fallback to client-side conversion
      if (currentFileRef.current) {
        performClientConversion(currentFileRef.current);
      }
    }
  });

  const validateFile = useCallback(async (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");
        const pdfWorker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF info:", err);
      }
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select a PDF file",
    };
  }, []);

  const handleClear = () => {
    setNumPages(0);
    setPageRange("");
    setSinglePage("1");
    setPageMode("all");
    setOutputFiles([]);
    setIsProcessing(false);
    setSseUrl(null);
    setTaskId(null);
    currentFileRef.current = null;
  };

  // Client-side conversion (existing logic)
  const performClientConversion = async (file) => {
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
      const pdfWorker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let pagesToRender = [];
      if (pageMode === "all") {
        pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else if (pageMode === "single") {
        const pageNum = parseInt(singlePage);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
          throw new Error(`Invalid page number: ${singlePage}`);
        }
        pagesToRender = [pageNum];
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

      pagesToRender = [...new Set(pagesToRender)].sort((a, b) => a - b);

      if (pagesToRender.length === 0) {
        throw new Error("No valid pages selected");
      }

      setOutputFiles([]);
      const zip = new JSZip();
      const results = [];

      for (let i = 0; i < pagesToRender.length; i++) {
        const pageNum = pagesToRender[i];
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        results.push({ name: `page-${pageNum}.png`, blob });
      }

      setOutputFiles(results);

      if (results.length === 1) {
        const url = window.URL.createObjectURL(results[0].blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, ".png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
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
      }
    } catch (error) {
      console.error("Client-side conversion error:", error);
      throw error;
    }
  };

  // Server-side conversion with SSE progress
  const performServerConversion = async (file, setStatusMessage, setStatusType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("scale", scale.toString());
    formData.append("pageMode", pageMode);
    formData.append("pageRange", pageRange);
    formData.append("singlePage", singlePage);

    try {
      const response = await axios.post("/api/convert-pdf-progress", formData, {
        baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
        headers: { "Content-Type": "multipart/form-data" }
      });

      const { task_id, stream_url } = response.data;
      setTaskId(task_id);
      setSseUrl(stream_url);
      setIsProcessing(true);
      setStatusMessage("Connected to server. Processing with progress tracking...");
      setStatusType("info");
      
    } catch (error) {
      console.error("Server conversion start error:", error);
      throw new Error("Server conversion failed");
    }
  };

  const handleCustomSubmit = async ({ file, setStatusMessage, setLoading, setStatusType }) => {
    currentFileRef.current = file;
    setStatusMessage("Starting PDF conversion...");
    
    try {
      // Try server-side conversion first (with SSE progress)
      await performServerConversion(file, setStatusMessage, setStatusType);
      setStatusMessage("Processing PDF with real-time progress tracking...");
      setStatusType("info");
      
    } catch (serverError) {
      console.warn("Server conversion failed, falling back to client-side:", serverError);
      setStatusMessage("Server unavailable. Using client-side conversion...");
      setStatusType("info");
      
      try {
        await performClientConversion(file);
        setStatusMessage("Success! Conversion completed in browser.");
        setStatusType("success");
      } catch (clientError) {
        setStatusMessage(`Error: ${clientError.message || "Conversion failed"}`);
        setStatusType("error");
      }
      
    } finally {
      setLoading(false);
      
      // Clear status after delay
      setTimeout(() => {
        if (!isProcessing) {
          setStatusMessage("");
        }
      }, 3000);
    }
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (

      <div className="w-full space-y-6 mb-8 text-left bg-white/50 p-6 rounded-xl border border-[#c7d2fe] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Progress Bar - Shows when processing */}
        {isProcessing && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
              📊 Real-Time Progress
            </h4>
            <ProgressBar progress={progress} />
            {!isConnected && (
              <p className="text-xs text-yellow-600 mt-2">Connecting to server...</p>
            )}
            {sseError && (
              <p className="text-xs text-red-600 mt-2">Connection issue: {sseError}</p>
            )}
          </div>
        )}


      <div className="w-full space-y-6 mb-8 text-left theme-card p-6 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">

        {/* Quality Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-[var(--color-app-text)] uppercase tracking-wider">
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
          <div className="flex justify-between text-[10px] theme-muted font-medium">
            <span>Standard (1x)</span>
            <span>High (3x)</span>
            <span>Ultra (5x)</span>
          </div>
        </div>
        
        {/* Document Language */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[var(--color-app-text)] uppercase tracking-wider block">
            Document Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2.5 theme-field rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-focus)] transition-all font-medium cursor-pointer"
          >
            <option value="eng">🇬🇧 English (Default)</option>
            <option value="hin">🇮🇳 Hindi (हिन्दी)</option>
            <option value="spa">🇪🇸 Spanish (Español)</option>
            <option value="fra">🇫🇷 French (Français)</option>
            <option value="deu">🇩🇪 German (Deutsch)</option>
          </select>
        </div>

        {/* Page Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-[var(--color-app-text)] uppercase tracking-wider">
            Page Selection {numPages > 0 && `(Total: ${numPages})`}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["all", "single", "range"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPageMode(mode)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-transform duration-200 cursor-pointer ${
                  pageMode === mode
                    ? "bg-[#4361ee] text-white shadow-[0_4px_10px_rgba(67,97,238,0.3)] scale-[1.02]"
                    : "theme-card theme-muted hover:border-[var(--color-app-primary)] hover:text-[var(--color-app-primary)]"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {pageMode === "single" && (
            <div className="animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-3">

                <span className="text-sm text-[#6b7280] font-medium">Page:</span>

                <span className="text-sm theme-muted font-medium">
                  Page:
                </span>

                <input
                  type="number"
                  min="1"
                  max={numPages}
                  value={singlePage}
                  onChange={(e) => setSinglePage(e.target.value)}
                  className="w-24 p-3 theme-field rounded-xl focus:outline-none focus:ring-4 focus:ring-[var(--color-app-focus)] focus:border-[var(--color-app-primary)] transition-colors font-bold text-center"
                />

                <span className="text-xs text-[#94a3b8]">of {numPages}</span>

                <span className="text-xs theme-subtle">
                  of {numPages}
                </span>

              </div>
            </div>
          )}

          {pageMode === "range" && (
            <div className="animate-in zoom-in-95 duration-200">
              <input
                type="text"
                placeholder="e.g. 1-3, 5"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="w-full p-3 theme-field rounded-xl focus:outline-none focus:ring-4 focus:ring-[var(--color-app-focus)] focus:border-[var(--color-app-primary)] transition-colors font-medium"
              />
              <p className="mt-2 text-[11px] theme-muted">
                Enter page numbers or ranges (e.g., 1-5, 8, 10-12)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF to PNG Converter"
      description="Convert PDF pages to high-quality PNG images with real-time progress tracking"
      accept=".pdf"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText={isProcessing ? "Processing..." : "Convert to PNG"}
      loadingButtonText="Converting..."
      extraFields={extraFields}
      extraContent={() => <MultiFileResults files={outputFiles} />}
      maxWidthClass="max-w-[600px]"
      inputId="file-input"
      submitDisabled={isProcessing}
      defaultIcon={
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
      }
      defaultText="Choose PDF file or drag & drop here"
      supportText="Click to browse or drop your PDF file"
    />
  );
};

export default PdfPng;