import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  Eye,
  Scissors,
  ArrowRight,
  X,
  RotateCcw,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PdfSplit() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [totalPages, setTotalPages] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [deletedPages, setDeletedPages] = useState(new Set());
  const [previewModal, setPreviewModal] = useState(null);

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

      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      thumbs.push({
        pageNum: i,
        src: canvas.toDataURL("image/jpeg", 0.92),
      });

      setPreviews([...thumbs]);
    }
  };

  const pickFile = async (f) => {
    if (!f) return;

    if (
      f.type !== "application/pdf" &&
      !f.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Only PDF files are accepted.");
      return;
    }

    const MAX_SIZE_MB = 10;

    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds ${MAX_SIZE_MB} MB.`);
      return;
    }

    setFile(f);
    setError(null);
    setResultUrl(null);
    setPreviews([]);
    setDeletedPages(new Set());

    try {
      const bytes = await f.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

      setTotalPages(pdf.numPages);
      setStartPage("1");
      setEndPage(String(pdf.numPages));

      await generateThumbnails(pdf);
    } catch {
      setError("Unable to read PDF.");
      setTotalPages(null);
    }
  };

  const clearFile = (e) => {
    e?.stopPropagation();

    setFile(null);
    setTotalPages(null);
    setPreviews([]);
    setStartPage("1");
    setEndPage("1");
    setError(null);
    setResultUrl(null);
    setDeletedPages(new Set());
    setPreviewModal(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const clamp = (value, min, max) =>
    Math.min(Math.max(Number(value), min), max);

  const validatePages = () => {
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);

    if (Number.isNaN(sp) || Number.isNaN(ep)) {
      return "Please enter valid page numbers.";
    }

    if (sp < 1) {
      return "Start page must be at least 1.";
    }

    if (totalPages && ep > totalPages) {
      return `End page cannot exceed ${totalPages}.`;
    }

    if (sp > ep) {
      return "Start page cannot be greater than end page.";
    }

    return null;
  };

  const deletePage = (e, pageNum) => {
    e.stopPropagation();
    setDeletedPages((prev) => new Set(prev).add(pageNum));
    toast(`Page ${pageNum} removed from output`, { icon: "🗑️" });
  };

  const restorePage = (e, pageNum) => {
    e.stopPropagation();
    setDeletedPages((prev) => {
      const next = new Set(prev);
      next.delete(pageNum);
      return next;
    });
    toast(`Page ${pageNum} restored`, { icon: "↩️" });
  };

  const handleSplit = async () => {
    if (!file) {
      toast.error("Select a PDF first.");
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
      const buffer = await file.arrayBuffer();

      const originalPdf = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();

      const startIdx = parseInt(startPage, 10) - 1;
      const endIdx = parseInt(endPage, 10) - 1;

      const pageIndices = Array.from(
        { length: endIdx - startIdx + 1 },
        (_, i) => startIdx + i,
      ).filter((idx) => !deletedPages.has(idx + 1));

      if (pageIndices.length === 0) {
        setError("All pages removed. Restore at least one.");
        setIsLoading(false);
        return;
      }

      const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      toast.success(`${pageIndices.length} page${pageIndices.length !== 1 ? "s" : ""} extracted successfully`);
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
    <div className="w-full max-w-6xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <h1 className="text-5xl font-bold text-center mb-3">Split PDF</h1>

      <p className="text-center text-slate-500 mb-10">
        Extract a specific range of pages from your PDF.
      </p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left */}
        <div>
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
              "border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all",
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-500",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => pickFile(e.target.files?.[0] || null)}
            />

            {file ? (
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {totalPages} pages
                    {deletedPages.size > 0 && (
                      <span className="ml-2 text-red-400">
                        · {deletedPages.size} removed
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={clearFile} className="ml-auto">
                  <Trash2 />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto mb-3" />
                <p>Click or drag a PDF here</p>
              </div>
            )}
          </div>

          {previews.length > 0 && (
            <div className="mt-6 border rounded-3xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={16} />
                Preview
                {deletedPages.size > 0 && (
                  <span className="ml-auto text-xs text-red-400 font-medium">
                    {deletedPages.size} page{deletedPages.size !== 1 ? "s" : ""} removed — hover to restore
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto">
                {previews.map((page) => {
                  const isDeleted = deletedPages.has(page.pageNum);
                  const inRange = isPageInRange(page.pageNum);

                  return (
                    <div
                      key={page.pageNum}
                      onClick={() => !isDeleted && setPreviewModal(page.src)}
                      className={cn(
                        "relative group border rounded-xl p-2 cursor-pointer transition-all duration-200",
                        isDeleted
                          ? "border-red-300 opacity-40 grayscale"
                          : inRange
                          ? "border-blue-500"
                          : "opacity-50",
                      )}
                    >
                      <img src={page.src} alt={`Page ${page.pageNum}`} />

                      {inRange && !isDeleted && (
                        <div className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Selected
                        </div>
                      )}

                      {isDeleted && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Removed
                        </div>
                      )}

                      <p className="text-center text-xs mt-2">
                        Page {page.pageNum}
                      </p>

                      {!isDeleted && (
                        <button
                          onClick={(e) => deletePage(e, page.pageNum)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-red-500 text-gray-500 hover:text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                          aria-label={`Remove page ${page.pageNum}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      {isDeleted && (
                        <button
                          onClick={(e) => restorePage(e, page.pageNum)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                          aria-label={`Restore page ${page.pageNum}`}
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div>
          <div className="border rounded-3xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Scissors size={16} />
              Extraction Range
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={startPage}
                disabled={!file}
                onChange={(e) => setStartPage(e.target.value)}
                onBlur={(e) => {
                  const v = clamp(e.target.value, 1, totalPages || 1);
                  setStartPage(String(v));
                }}
                className="border rounded-xl p-3"
              />

              <input
                type="number"
                value={endPage}
                disabled={!file}
                onChange={(e) => setEndPage(e.target.value)}
                onBlur={(e) => {
                  const v = clamp(e.target.value, 1, totalPages || 1);
                  setEndPage(String(v));
                }}
                className="border rounded-xl p-3"
              />
            </div>

            {file && !error && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                <Scissors size={18} />
                <div>
                  <p className="text-sm text-slate-500">Extracting</p>
                  <p className="font-semibold">
                    Pages {startPage} - {endPage}
                    {deletedPages.size > 0 && (
                      <span className="text-red-400 font-normal text-sm ml-1">
                        (excl. {deletedPages.size} removed)
                      </span>
                    )}
                  </p>
                </div>
                <ArrowRight className="ml-auto" />
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl flex items-center gap-2 text-red-500">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleSplit}
              disabled={!file || isLoading}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Extract Pages"}
            </button>

            {resultUrl && (
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} />
                  Ready for download
                </div>

                <a
                  href={resultUrl}
                  download={`${file?.name.replace(/\.pdf$/i, "")}_${startPage}-${endPage}.pdf`}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

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
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center"
              aria-label="Close preview"
            >
              <X size={16} />
            </button>
            <img
              src={previewModal}
              alt="Full page preview"
              className="max-w-full max-h-[82vh] rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
