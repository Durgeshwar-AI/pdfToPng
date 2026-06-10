import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { Toaster, toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  Eye,
  Scissors,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function PdfSplit() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [totalPages, setTotalPages] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const generateThumbnails = async (pdf) => {
    const thumbs = [];
    const limit = Math.min(pdf.numPages, 50);

    for (let i = 1; i <= limit; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      thumbs.push({
        pageNum: i,
        src: canvas.toDataURL(),
      });
    }
    setPreviews(thumbs);
  };

  const pickFile = async (f) => {
    if (!f) return;

    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted.");
      return;
    }

    setFile(f);
    setResultUrl(null);
    setError(null);
    setPreviews([]);

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;
      setTotalPages(pdf.numPages);
      setStartPage("1");
      setEndPage(String(pdf.numPages));
      await generateThumbnails(pdf);
    } catch {
      setTotalPages(null);
      setError("Unable to read PDF page count.");
    }
  };

  const clearFile = (e) => {
    if (e) e.stopPropagation();
    setFile(null);
    setTotalPages(null);
    setPreviews([]);
    setStartPage("1");
    setEndPage("1");
    setError(null);
    setResultUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const clamp = (val, min, max) => Math.min(Math.max(Number(val), min), max);

  const validatePages = () => {
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);

    if (isNaN(sp) || isNaN(ep)) return "Please enter valid page numbers.";
    if (sp < 1) return "Start page must be at least 1.";
    if (totalPages && ep > totalPages)
      return `End page cannot exceed ${totalPages} (total pages).`;
    if (sp > ep) return "Start page cannot be greater than end page.";
    return null;
  };

  const handleSplit = async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    const validationError = validatePages();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      const startIdx = parseInt(startPage, 10) - 1;
      const endIdx = parseInt(endPage, 10) - 1;

      if (startIdx < 0 || endIdx >= originalPdfDoc.getPageCount() || startIdx > endIdx) {
        throw new Error("Invalid page range for splitting.");
      }

      const pages = await newPdfDoc.copyPages(originalPdfDoc, Array.from({ length: endIdx - startIdx + 1 }, (_, i) => startIdx + i));
      pages.forEach((page) => newPdfDoc.addPage(page));

      const pdfBytes = await newPdfDoc.save();

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      toast.success(`Success! Pages ${startPage}–${endPage} extracted.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isPageInRange = (pageNum) => {
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);
    return pageNum >= sp && pageNum <= ep;
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto p-6 md:p-10 text-center flex flex-col items-center bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <Toaster position="top-right" richColors />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-[#1a1a2e] text-5xl font-extrabold tracking-tight"
      >
        Split PDF
      </motion.h1>

      <p className="text-slate-500 mb-10 max-w-xl text-base leading-relaxed">
        Extract a specific range of pages from your PDF into a new document.
      </p>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel */}
        <div className="space-y-6 text-left">
          <div
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              pickFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
              isDragging
                ? "border-[#4361ee] bg-blue-50 scale-[1.03] shadow-lg"
                : "border-slate-200 bg-slate-50/50 hover:border-[#4361ee] hover:bg-white hover:shadow-xl"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] || null)}
            />

            {file ? (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-[#1a1a2e] font-bold text-sm truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-slate-500 text-xs">{totalPages} pages</p>
                </div>
                <button
                  onClick={clearFile}
                  className="ml-4 p-2 text-red-500 hover:bg-red-100 rounded-full"
                  aria-label="Remove file"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                  <Upload size={24} />
                </div>
                <p className="text-[#1a1a2e] font-bold text-sm">
                  Click or drag & drop a PDF
                </p>
              </div>
            )}
          </div>

          {previews.length > 0 && (
            <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-4">
                <Eye size={16} /> Preview Selection
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] p-2">
                {previews.map((item) => (
                  <div
                    key={item.pageNum}
                    className={cn(
                      "relative group bg-white border rounded-2xl p-2 transition-all shadow-sm",
                      isPageInRange(item.pageNum)
                        ? "border-[#4361ee] ring-2 ring-blue-100"
                        : "border-slate-100 opacity-50"
                    )}
                  >
                    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl mb-2">
                      <img
                        src={item.src}
                        className="max-w-full max-h-full object-contain"
                        alt={`Page ${item.pageNum}`}
                      />
                    </div>
                    <div className="text-center text-[10px] font-bold text-slate-500">
                      Page {item.pageNum}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-6">
              <Scissors size={16} /> Extraction Range
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-tight text-slate-400">
                  Start Page
                </label>
                <input
                  type="number"
                  value={startPage}
                  disabled={!file || isLoading}
                  onChange={(e) => setStartPage(e.target.value)}
                  onBlur={(e) => {
                    const clamped = clamp(e.target.value, 1, totalPages || 1);
                    setStartPage(String(clamped));
                    if (clamped > parseInt(endPage)) setEndPage(String(clamped));
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-tight text-slate-400">
                  End Page
                </label>
                <input
                  type="number"
                  value={endPage}
                  disabled={!file || isLoading}
                  onChange={(e) => setEndPage(e.target.value)}
                  onBlur={(e) => {
                    const sp = parseInt(startPage) || 1;
                    const clamped = clamp(e.target.value, sp, totalPages || sp);
                    setEndPage(String(clamped));
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            {file && !error && (
              <div className="mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Scissors size={20} />
                </div>
                <div className="text-xs">
                  <p className="text-slate-500 font-medium">Extracting</p>
                  <p className="text-[#1a1a2e] font-black">
                    Pages {startPage} to {endPage}
                  </p>
                </div>
                <ArrowRight className="ml-auto text-blue-300" size={16} />
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleSplit}
              disabled={!file || isLoading}
              className="w-full bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCcw size={20} className="animate-spin" />
              ) : (
                "Split PDF Now"
              )}
            </button>

            {resultUrl && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 bg-[#f0f9ff] border border-blue-100 rounded-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase">
                  <CheckCircle2 size={16} />
                  Ready for download
                </div>
                <a
                  href={resultUrl}
                  download={`${file?.name.replace(/\.pdf$/i, "")}_split_${startPage}-${endPage}.pdf`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Download size={20} />
                  DOWNLOAD SPLIT PDF
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PdfSplit;
