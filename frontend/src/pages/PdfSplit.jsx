import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  Eye,
  Scissors,
  X,
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
  const [totalPages, setTotalPages] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [deletedPages, setDeletedPages] = useState(new Set());
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const generateThumbnails = async (pdf) => {
    setLoadingThumbs(true);
    const thumbs = [];
    const limit = Math.min(pdf.numPages, 50);

    for (let i = 1; i <= limit; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      thumbs.push({ pageNum: i, src: canvas.toDataURL("image/jpeg", 0.85) });
      setPreviews([...thumbs]);
    }
    setLoadingThumbs(false);
  };

  const pickFile = async (f) => {
    if (!f) return;

    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted.");
      return;
    }

    const MAX_FILE_SIZE_MB = 10;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }

    setFile(f);
    setResultUrl(null);
    setError(null);
    setPreviews([]);
    setDeletedPages(new Set());

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;
      setTotalPages(pdf.numPages);

      // Select all pages by default
      const allPages = new Set(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
      setSelectedPages(allPages);

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
    setSelectedPages(new Set());
    setDeletedPages(new Set());
    setError(null);
    setResultUrl(null);
    setPreviewModal(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Actually delete a page — removes from selectedPages and hides from grid
  const deletePage = (e, pageNum) => {
    e.stopPropagation();
    setSelectedPages((prev) => {
      const next = new Set(prev);
      next.delete(pageNum);
      return next;
    });
    setDeletedPages((prev) => new Set(prev).add(pageNum));
    toast(`Page ${pageNum} removed from output`, { icon: "🗑️" });
  };

  // Restore a deleted page
  const restorePage = (e, pageNum) => {
    e.stopPropagation();
    setSelectedPages((prev) => new Set(prev).add(pageNum));
    setDeletedPages((prev) => {
      const next = new Set(prev);
      next.delete(pageNum);
      return next;
    });
    toast(`Page ${pageNum} restored`, { icon: "↩️" });
  };

  const handleSplit = async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    if (selectedPages.size === 0) {
      setError("No pages selected. Please restore at least one page.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      // Copy only selected pages, in order
      const pageIndices = Array.from(selectedPages)
        .sort((a, b) => a - b)
        .map((p) => p - 1); // pdf-lib uses 0-based index

      const pages = await newPdfDoc.copyPages(originalPdfDoc, pageIndices);
      pages.forEach((page) => newPdfDoc.addPage(page));

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      toast.success(`Done! ${selectedPages.size} page${selectedPages.size !== 1 ? "s" : ""} extracted.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = selectedPages.size;
  const deletedCount = deletedPages.size;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-[#1a1a2e] dark:text-white text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
          Split PDF
        </h1>
        <p className="text-slate-500 mt-6 text-base">
          Select pages to keep — delete any you don't need — then extract.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── LEFT PANEL ── */}
        <div className="space-y-6 text-left">

          {/* Drop Zone */}
          <div
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); pickFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !file && inputRef.current?.click()}
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
              <div className="flex items-center gap-3 w-full">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full shrink-0">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1a1a2e] font-bold text-sm truncate">{file.name}</p>
                  <p className="text-slate-500 text-xs">
                    {totalPages} pages total · {selectedCount} selected
                    {deletedCount > 0 && ` · ${deletedCount} removed`}
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-full shrink-0"
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
                  {isDragging ? "Drop your PDF here" : "Click or drag & drop a PDF"}
                </p>
                <p className="text-slate-400 text-xs mt-1">PDF only · max 10 MB</p>
              </div>
            )}
          </div>

          {/* Preview Grid */}
          {(previews.length > 0 || loadingThumbs) && (
            <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
                  <Eye size={16} /> Page Preview
                </div>
                {previews.length > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-[#4361ee] font-medium">
                    {previews.length} / {totalPages ?? "?"} loaded
                  </span>
                )}
              </div>

              {/* Skeleton while loading */}
              {loadingThumbs && previews.length === 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl bg-gray-100 animate-pulse" style={{ aspectRatio: "3/4" }} />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[420px] pr-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#c7d2fe transparent" }}>

                {previews.map((item) => {
                  const isDeleted = deletedPages.has(item.pageNum);
                  const isSelected = selectedPages.has(item.pageNum);

                  return (
                    <div
                      key={item.pageNum}
                      onClick={() => !isDeleted && setPreviewModal(item.src)}
                      className={cn(
                        "relative group rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer",
                        isDeleted
                          ? "border-red-200 opacity-40 grayscale"
                          : isSelected
                          ? "border-[#4361ee] ring-2 ring-blue-100 shadow-md"
                          : "border-slate-200"
                      )}
                    >
                      <img
                        src={item.src}
                        alt={`Page ${item.pageNum}`}
                        className="w-full object-cover"
                        style={{ aspectRatio: "3/4", display: "block" }}
                        draggable={false}
                      />

                      {/* Selected badge */}
                      {isSelected && !isDeleted && (
                        <div className="absolute top-2 left-2 bg-[#4361ee] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          ✓ Keep
                        </div>
                      )}

                      {/* Deleted badge */}
                      {isDeleted && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Removed
                        </div>
                      )}

                      {/* Page number + zoom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1.5 flex items-end justify-between">
                        <span className="text-white text-[10px] font-semibold drop-shadow">
                          Page {item.pageNum}
                        </span>
                        {!isDeleted && (
                          <Eye size={12} className="text-white/60 group-hover:text-white transition-colors" />
                        )}
                      </div>

                      {/* Action button: delete or restore */}
                      {isDeleted ? (
                        <button
                          onClick={(e) => restorePage(e, item.pageNum)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-green-500 hover:bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md text-xs font-bold"
                          aria-label={`Restore page ${item.pageNum}`}
                        >
                          ↩
                        </button>
                      ) : (
                        <button
                          onClick={(e) => deletePage(e, item.pageNum)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-white/90 hover:bg-red-500 text-gray-600 hover:text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                          aria-label={`Delete page ${item.pageNum}`}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Skeleton for remaining pages still rendering */}
                {loadingThumbs &&
                  Array.from({ length: Math.max(0, (totalPages ?? 0) - previews.length) }).map((_, i) => (
                    <div key={`sk-${i}`} className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" style={{ aspectRatio: "3/4" }} />
                  ))}
              </div>

              {deletedCount > 0 && (
                <p className="mt-3 text-xs text-red-500 font-medium text-center">
                  {deletedCount} page{deletedCount !== 1 ? "s" : ""} will be excluded from output.
                  Hover a removed page and click ↩ to restore.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="space-y-6">
          <div className="w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-left">

            <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-6">
              <Scissors size={16} /> Extraction Summary
            </div>

            {/* Summary card */}
            {file && (
              <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Total pages</span>
                  <span className="font-black text-[#1a1a2e]">{totalPages ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Pages to extract</span>
                  <span className="font-black text-[#4361ee]">{selectedCount}</span>
                </div>
                {deletedCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Pages removed</span>
                    <span className="font-black text-red-500">{deletedCount}</span>
                  </div>
                )}
                {selectedCount > 0 && (
                  <div className="pt-2 border-t border-blue-100 text-xs text-slate-500">
                    Pages:{" "}
                    <span className="font-bold text-[#1a1a2e]">
                      {Array.from(selectedPages).sort((a, b) => a - b).join(", ")}
                    </span>
                  </div>
                )}
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
              disabled={!file || isLoading || selectedCount === 0}
              className="w-full bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-5 h-5 border-[3px] border-white/30 rounded-full border-t-white animate-spin" />
                  Splitting...
                </>
              ) : (
                <>
                  <Scissors size={18} />
                  Extract {selectedCount > 0 ? `${selectedCount} Page${selectedCount !== 1 ? "s" : ""}` : "PDF"}
                </>
              )}
            </button>

            {/* Download */}
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
                  download={`${file?.name.replace(/\.pdf$/i, "")}_split_${selectedCount}pages.pdf`}
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

      {/* Full-screen preview modal */}
      {previewModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative bg-white rounded-2xl p-4 max-w-3xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md"
              aria-label="Close preview"
            >
              <X size={16} />
            </button>
            <img src={previewModal} alt="Full page preview" className="max-w-full max-h-[82vh] rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

export default PdfSplit;