import { useState, useCallback, useEffect, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText, Hash, LayoutGrid, Eye } from "lucide-react";
import { toastSuccess, toastError, toastLoading, toastDismiss } from "../utils/toast";
import { useHistory } from "../context/HistoryContext";
import * as pdfjsLib from "pdfjs-dist";

import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
const PREVIEW_WIDTH = 380;

function PdfPageNumber() {
  const { addToHistory } = useHistory();
  const [style, setStyle] = useState("page-of");
  const [position, setPosition] = useState("bottom-center");
  const [fontSize, setFontSize] = useState(10);
  const [marginX, setMarginX] = useState(20);
  const [marginY, setMarginY] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const lastFileRef = useRef(null);
  const debounceRef = useRef(null);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: "Error: Please select a PDF file" };
  }, []);

  const {
    file, loading, isDragging, fileInputRef, dropAreaRef,
    handleFileChange, handleClear, handleDragEnter, handleDragOver,
    handleDragLeave, handleDrop, handleAreaClick,
  } = useFileUpload(validateFile);

  const handleClearAll = (e) => {
    handleClear(e);
    setStyle("page-of");
    setPosition("bottom-center");
    setFontSize(10);
    setMarginX(20);
    setMarginY(20);
    pdfDocRef.current = null;
    setPreviewError(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const buildLabel = (pageIndex, totalPages) => {
    if (style === "simple") return `${pageIndex + 1}`;
    if (style === "page-of") return `Page ${pageIndex + 1} of ${totalPages}`;
    if (style === "fraction") return `${pageIndex + 1}/${totalPages}`;
    return "";
  };

  const renderPreview = useCallback(async () => {
    if (!file) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      if (!pdfDocRef.current || lastFileRef.current !== file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        pdfDocRef.current = pdf;
        lastFileRef.current = file;
      }

      const pdf = pdfDocRef.current;
      const totalPages = pdf.numPages;
      const page = await pdf.getPage(1);

      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = PREVIEW_WIDTH / unscaledViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Same position math as handleSubmit, just scaled + flipped for canvas
      const text = buildLabel(0, totalPages);
      const scaledFontSize = fontSize * scale;
      ctx.font = `${scaledFontSize}px Helvetica, Arial, sans-serif`;
      ctx.fillStyle = "rgba(77, 77, 77, 0.95)";
      const textWidth = ctx.measureText(text).width;

      const width = viewport.width;
      const height = viewport.height;
      const sMarginX = marginX * scale;
      const sMarginY = marginY * scale;

      let x = 0, yFromBottom = 0;
      if (position === "bottom-center") { x = width / 2 - textWidth / 2; yFromBottom = sMarginY; }
      else if (position === "bottom-right") { x = width - textWidth - sMarginX; yFromBottom = sMarginY; }
      else if (position === "top-center") { x = width / 2 - textWidth / 2; yFromBottom = height - sMarginY - scaledFontSize; }
      else if (position === "top-right") { x = width - textWidth - sMarginX; yFromBottom = height - sMarginY - scaledFontSize; }

      ctx.fillText(text, x, height - yFromBottom);
    } catch (err) {
      console.error("Preview render failed:", err);
      setPreviewError("Couldn't render a preview for this PDF.");
    } finally {
      setPreviewLoading(false);
    }
  }, [file, style, position, fontSize, marginX, marginY]);

  useEffect(() => {
    if (!file) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => renderPreview(), 150);
    return () => clearTimeout(debounceRef.current);
  }, [file, style, position, fontSize, marginX, marginY, renderPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toastError("Please select a PDF file first"); return; }

    setIsProcessing(true);
    const loadingId = toastLoading("Adding page numbers...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      pages.forEach((page, index) => {
        let text = "";
        if (style === "simple") text = `${index + 1}`;
        else if (style === "page-of") text = `Page ${index + 1} of ${total}`;
        else if (style === "fraction") text = `${index + 1}/${total}`;

        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x = 0, y = 0;

        if (position === "bottom-center") { x = width / 2 - textWidth / 2; y = marginY; }
        else if (position === "bottom-right") { x = width - textWidth - marginX; y = marginY; }
        else if (position === "top-center") { x = width / 2 - textWidth / 2; y = height - marginY - fontSize; }
        else if (position === "top-right") { x = width - textWidth - marginX; y = height - marginY - fontSize; }

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes] as BlobPart[], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      const downloadName = `${baseName}_numbered.pdf`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toastDismiss(loadingId);
      toastSuccess("Your numbered PDF has been downloaded!");

      const historyUrl = window.URL.createObjectURL(blob);
      addToHistory({
        fileName: file.name,
        conversionType: "PDF Page Numbering",
        downloadUrl: historyUrl,
        downloadName: downloadName,
      });
    } catch (err) {
      toastDismiss(loadingId);
      if (err.message && err.message.toLowerCase().includes("encrypted")) {
        toastError("The uploaded PDF is password protected. Please unlock it first.");
      } else {
        toastError(err.message || "Failed to process PDF.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] dark:text-white text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        PDF Page Numbering
      </h1>
      <p className="theme-muted text-sm mb-8 -mt-6">
        Add custom page numbers to your PDF documents entirely in the browser.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file} isDragging={isDragging} fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef} handleFileChange={handleFileChange}
          handleClear={handleClearAll} handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver} handleDragLeave={handleDragLeave}
          handleDrop={handleDrop} handleAreaClick={handleAreaClick}
          accept=".pdf,application/pdf" inputId="pdf-page-number-input"
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a PDF file to number"
          supportText="Draws page numbers client-side using pdf-lib"
        />

        {file && !loading && (
          <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-6">
              <LayoutGrid className="w-4 h-4 text-[#4361ee]" />
              Page Numbering Options
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Numbering Style</span>
                <select value={style} onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all">
                  <option value="simple">Simple (1, 2, 3...)</option>
                  <option value="page-of">Page X of Y</option>
                  <option value="fraction">Fraction (X/Y)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</span>
                <select value={position} onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all">
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Font Size ({fontSize}pt)</span>
                <input type="range" min={6} max={24} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Horizontal Margin ({marginX}px)</span>
                <input type="range" min={5} max={100} value={marginX} disabled={position.includes("center")}
                  onChange={(e) => setMarginX(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 disabled:opacity-40" />
              </label>
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Vertical Margin ({marginY}px)</span>
                <input type="range" min={5} max={100} value={marginY} onChange={(e) => setMarginY(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200" />
              </label>
            </div>
          </div>
        )}

        {file && !loading && (
          <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#4361ee]" />
              Live Preview
            </p>
            <div className="w-full flex justify-center bg-gray-50 rounded-lg p-4 relative min-h-[200px]">
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                  <span className="inline-block w-6 h-6 border-[3px] border-gray-200 rounded-full border-t-[#4361ee] animate-spin"></span>
                </div>
              )}
              {previewError ? (
                <p className="text-sm text-red-500 py-8">{previewError}</p>
              ) : (
                <canvas ref={canvasRef} className="max-w-full border border-gray-200 shadow-sm rounded-sm bg-white" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Preview reflects page 1 — the same style, position, and size will be applied to every page on export.
            </p>
          </div>
        )}

        <button type="submit" disabled={!file || loading || isProcessing}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading || isProcessing ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
              Processing...
            </>
          ) : (
            <>
              <Hash className="w-5 h-5 mr-1" />
              Add Page Numbers
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfPageNumber;