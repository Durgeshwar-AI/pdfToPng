import React, { useCallback, useState, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import JSZip from "jszip";

import ToolPageTemplate from "../components/ToolPageTemplate";
import MultiFileResults from "../components/MultiFileResults";
import {
  toastError,
  toastLoading,
  toastDismiss,
  parseApiError,
} from "../utils/toast";

const PdfPng = () => {
  const [scale, setScale] = useState(2.0);
  const [pageMode, setPageMode] = useState("all");
  const [pageRange, setPageRange] = useState("");
  const [singlePage, setSinglePage] = useState("1");
  const [numPages, setNumPages] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [previewImage , setPreviewImage] = useState(null);
  const [cropEnabled , setCropEnabled] = useState(false);
  const [crop , setCrop] = useState({
    unit : "%" as const,
    x : 10,
    y : 10,
    width : 80,
    height : 80,
  });

  useEffect(() => {
    const generatePreview = async () => {
      try {
        if (!cropEnabled) return;
        const input = document.querySelector('input[type="file"]');
        const selectedFile = input?.files?.[0];
        if (!selectedFile) return;
        const pdfjsLib = await import("pdfjs-dist");
        const pdfWorker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPreviewImage(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Preview error:", err);
      }
    };
    generatePreview();
  }, [cropEnabled]);

<<<<<<< HEAD
      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;;
      const selectedFile = input?.files?.[0];

      if (!selectedFile) return;

      const pdfjsLib = await import("pdfjs-dist");

      const pdfWorker = await import(
        "pdfjs-dist/build/pdf.worker.min.mjs?url"
      );

      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;

      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");

      await page.render({
        canvasContext: ctx,
        viewport,
	canvas: canvas,
      }).promise;

      setPreviewImage(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  generatePreview();
}, [cropEnabled]);
=======
>>>>>>> origin/main
  const [outputFiles, setOutputFiles] = useState([]);

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
      message: "Please select a valid PDF file.",
    };
  }, []);

  const handleClear = () => {
    setNumPages(0);
    setPageRange("");
    setSinglePage("1");
    setPageMode("all");
    setCropEnabled(false);
    setPreviewImage(null);
    setOutputFiles([]);
  };

  const handleCustomSubmit = async ({ file, setStatusMessage, setLoading, addToHistory }) => {
    setStatusMessage("Loading PDF...");
    let loadingToastId = null;

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
          toastError(`Invalid page number: ${singlePage}. Please enter a value between 1 and ${totalPages}.`);
          setStatusMessage("");
          setLoading(false);
          return;
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
        toastWarningMsg("No valid pages selected. Please check your range.");
        setStatusMessage("");
        setLoading(false);
        return;
      }

      setOutputFiles([]);
      loadingToastId = toastLoading(`Converting ${pagesToRender.length} page${pagesToRender.length > 1 ? "s" : ""} to PNG...`);

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
<<<<<<< HEAD

        await page.render({ canvas: canvas, canvasContext: context, viewport }).promise;
=======
        await page.render({ canvasContext: context, viewport }).promise;
>>>>>>> origin/main

        if (cropEnabled) {
          const croppedCanvas = document.createElement("canvas");
          const sx = (crop.x / 100) * canvas.width;
          const sy = (crop.y / 100) * canvas.height;
          const sw = (crop.width / 100) * canvas.width;
          const sh = (crop.height / 100) * canvas.height;
          croppedCanvas.width = sw;
          croppedCanvas.height = sh;
          const croppedCtx = croppedCanvas.getContext("2d");
          if (!croppedCtx) throw new Error("Failed to get canvas context");
          croppedCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
          const blob = await new Promise((resolve) => croppedCanvas.toBlob(resolve, "image/png"));
          results.push({ name: `page-${pageNum}.png`, blob });
        } else {
          const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
          results.push({ name: `page-${pageNum}.png`, blob });
        }
      }

      setOutputFiles(results);
      setStatusMessage("");

      if (results.length === 1) {
        const url = window.URL.createObjectURL(results[0].blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, ".png");
        document.body.appendChild(a);
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingToastId);

        if (addToHistory) {
          const historyUrl = window.URL.createObjectURL(results[0].blob);
          addToHistory(historyUrl, file.name.replace(/\.pdf$/i, ".png"));
        }
      } else {
        setStatusMessage("Packaging files into ZIP...");
        results.forEach((res) => zip.file(res.name, res.blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.replace(/\.pdf$/i, "")}_pages.zip`;
        document.body.appendChild(a);
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setStatusMessage("");
        toastDismiss(loadingToastId);

        if (addToHistory) {
          const historyUrl = window.URL.createObjectURL(zipBlob);
          addToHistory(historyUrl, `${file.name.replace(/\.pdf$/i, "")}_pages.zip`);
        }
      }
    } catch (error) {
      console.error("Client-side conversion error:", error);
      if (loadingToastId) toastDismiss(loadingToastId);

      const serverLoadingId = toastLoading("Client conversion failed — trying server fallback...");
      setStatusMessage("Trying server fallback...");

      try {
        const form = new FormData();
        form.append("file", file);
        form.append("language", language);

        const tryUrls = ["/convertPng", "http://localhost:5000/convertPng"];
        let response = null;
        for (const url of tryUrls) {
          try {
            response = await fetch(url, { method: "POST", body: form });
            if (response && response.ok) break;
          } catch (e) {
            console.warn("Server convert attempt failed:", url, e);
            response = null;
          }
        }

        if (response && response.ok) {
          const blob = await response.blob();
          const name = file.name.replace(/\.pdf$/i, ".png");
          setOutputFiles([{ name, blob }]);
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = file.name.replace(/\.pdf$/i, ".png");
          document.body.appendChild(a);
          document.body.removeChild(a);
          window.URL.revokeObjectURL(downloadUrl);
          setStatusMessage("");
          toastDismiss(serverLoadingId);

          if (addToHistory) {
            const historyUrl = window.URL.createObjectURL(blob);
            addToHistory(historyUrl, file.name.replace(/\.pdf$/i, ".png"));
          }
        } else {
          const msg = response
            ? await parseApiError(null, response)
            : "Server conversion unavailable. Please try again later.";
          setStatusMessage("");
          toastDismiss(serverLoadingId);
          toastError(msg);
        }
      } catch (serverErr) {
        console.error("Server fallback error:", serverErr);
        setStatusMessage("");
        toastDismiss(serverLoadingId);
        toastError(await parseApiError(serverErr) || "Failed to convert file. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toastWarningMsg = (msg) => {
    import("sonner").then(({ toast }) => toast.warning(msg, { duration: 5000 }));
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full space-y-6 mb-8 text-left theme-card p-6 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
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

        <div className="space-y-3">
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={cropEnabled}
              onChange={(e) => setCropEnabled(e.target.checked)}
            />
            Enable Crop Tool
          </label>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-[var(--color-app-text)] uppercase tracking-wider block">
            Document Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2.5 theme-field rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-app-focus)] transition-all font-medium cursor-pointer"
          >
            <option value="eng">GB English (Default)</option>
            <option value="hin">IN Hindi</option>
            <option value="spa">ES Spanish</option>
            <option value="fra">FR French</option>
            <option value="deu">DE German</option>
          </select>
        </div>

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
                <span className="text-sm theme-muted font-medium">Page:</span>
                <input
                  type="number"
                  min="1"
                  max={numPages}
                  value={singlePage}
                  onChange={(e) => setSinglePage(e.target.value)}
                  className="w-24 p-3 theme-field rounded-xl focus:outline-none focus:ring-4 focus:ring-[var(--color-app-focus)] focus:border-[var(--color-app-primary)] transition-colors font-bold text-center"
                />
                <span className="text-xs theme-subtle">of {numPages}</span>
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

          {previewImage && cropEnabled && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Select Area To Convert</h3>
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
                <img src={previewImage} alt="PDF Preview" />
              </ReactCrop>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF to PNG Converter"
      description="Convert PDF pages to high-quality PNG images"
      accept=".pdf"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Convert to PNG"
      loadingButtonText="Converting..."
      extraFields={extraFields}
      extraContent={() => <MultiFileResults files={outputFiles} />}
      maxWidthClass="max-w-[600px]"
      inputId="file-input"
      defaultIcon={
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      defaultText="Choose PDF file or drag & drop here"
      supportText="Click to browse or drop your PDF file"
    />
  );
};

export default PdfPng;
