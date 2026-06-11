import { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { PDFDocument, degrees } from "pdf-lib";
import { Toaster, toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  FileText,
  Download,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ACTIONS = [
  { id: "rotate_left", label: "Rotate Left", icon: RotateCcw },
  { id: "rotate_right", label: "Rotate Right", icon: RotateCw },
  { id: "flip_h", label: "Flip Horizontal", icon: FlipHorizontal2 },
  { id: "flip_v", label: "Flip Vertical", icon: FlipVertical2 },
];

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PdfRotateFlip() {
  // State
  const [file, setFile] = useState(null);
  const [scope, setScope] = useState("all");
  const [pages, setPages] = useState("");
  const [selectedPreviewPages, setSelectedPreviewPages] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const inputRef = useRef(null);

  // Effects
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  useEffect(() => {
    if (selectedPreviewPages.length > 0) {
      setScope("selection");
      const sorted = [...selectedPreviewPages].sort((a, b) => a - b);
      const rangeStr = sorted.join(",");
      if (rangeStr !== pages) setPages(rangeStr);
    } else {
      setScope("all");
      setPages("");
    }
  }, [selectedPreviewPages, pages]);

  // Helper functions
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
        originalPageNum: i,
        src: canvas.toDataURL(),
        currentRotation: 0,
        currentFlippedH: false,
        currentFlippedV: false,
      });
    }

    setPreviews(thumbs);
  };

  const pickFile = async (f) => {
    if (!f) return;

    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }

    setFile(f);
    setResultUrl(null);
    setError(null);
    setScope("all");
    setPages("");
    setSelectedPreviewPages([]);
    setPreviews([]);

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: bytes,
        verbosity: 0,
      }).promise;
      setTotalPages(pdf.numPages);
      await generateThumbnails(pdf);
    } catch {
      setTotalPages(null);
      setError("Unable to read PDF page count.");
    }
  };

  const handlePreviewAction = (actionId) => {
    setPreviews(prevPreviews =>
      prevPreviews.map(p => {
        const isTargetPage =
          scope === "all" ||
          (scope === "selection" && selectedPreviewPages.includes(p.originalPageNum));

        if (!isTargetPage) return p;

        let newRotation = p.currentRotation;
        let newFlippedH = p.currentFlippedH;
        let newFlippedV = p.currentFlippedV;

        switch (actionId) {
          case "rotate_left":
            newRotation = (newRotation - 90 + 360) % 360;
            break;
          case "rotate_right":
            newRotation = (newRotation + 90) % 360;
            break;
          case "flip_h":
            newFlippedH = !newFlippedH;
            break;
          case "flip_v":
            newFlippedV = !newFlippedV;
            break;
        }

        return {
          ...p,
          currentRotation: newRotation,
          currentFlippedH: newFlippedH,
          currentFlippedV: newFlippedV,
        };
      })
    );
  };

  const resetPreviewTransforms = () => {
    setPreviews(prev =>
      prev.map(p => ({
        ...p,
        currentRotation: 0,
        currentFlippedH: false,
        currentFlippedV: false,
      }))
    );
  };

  
const transformAndDownload = async () => {
  if (!file || loading) return;

  if (previews.length === 0) {
    setError("No pages to process. Please upload a PDF.");
    return;
  }

  setLoading(true);
  setError(null);
  setResultUrl(null);

  try {
    const arrayBuffer = await file.arrayBuffer();

    const originalPdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    const total = previews.length;

    for (let i = 0; i < previews.length; i++) {
      const previewItem = previews[i];

      const originalIndex = previewItem.originalPageNum - 1;

      const [copiedPage] = await newPdfDoc.copyPages(
        originalPdfDoc,
        [originalIndex]
      );

      const shouldTransform =
        scope === "all" ||
        selectedPreviewPages.includes(previewItem.originalPageNum);

      if (shouldTransform) {
        copiedPage.setRotation(degrees(previewItem.currentRotation));
      }

      newPdfDoc.addPage(copiedPage);

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    const pdfBytes = await newPdfDoc.save();

    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });

    setResultUrl(URL.createObjectURL(blob));
    toast.success("PDF transformation complete!");
  } catch (e) {
    console.error(e);
    setError("Processing failed: " + (e.message || String(e)));
    toast.error(e.message || "Unknown error");
  } finally {
    setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 500);
  }
};


  const movePage = (index, direction) => {
    const newPreviews = [...previews];
    const [movedItem] = newPreviews.splice(index, 1);
    newPreviews.splice(index + direction, 0, movedItem);
    setPreviews(newPreviews);
  };

  const deletePage = (index) => {
    const deletedPageNum = previews[index].originalPageNum;
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setSelectedPreviewPages(prev => prev.filter(p => p !== deletedPageNum));
  };

  const togglePageSelection = (pageNum) => {
    setSelectedPreviewPages(prev =>
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum]
    );
  };

  const scopeLabel = scope === "all" ? "All" : "Selected";

  return (
    <div className="w-full max-w-[1100px] mx-auto p-6 md:p-10 text-center flex flex-col items-center bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <Toaster position="top-right" richColors />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-[#1a1a2e] text-5xl font-extrabold tracking-tight"
      >
        PDF Rotate & Flip
      </motion.h1>

      <p className="text-slate-500 mb-10 max-w-xl text-base leading-relaxed">
        Easily adjust the orientation of your PDF documents. Reorder pages, rotate or flip specific ranges.
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviews([]);
                    setSelectedPreviewPages([]);
                  }}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1a12e] uppercase tracking-wider">
                  <Eye size={16} />Preview & Reorder
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <button
                    onClick={() =>
                      setSelectedPreviewPages(previews.map(p => p.originalPageNum))
                    }
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedPreviewPages([])}
                    className="text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase transition-colors"
                  >
                    Clear
                  </button>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[400px] p-2">
                {previews.map((item, idx) => (
                  <div
                    key={item.originalPageNum}
                    className={cn(
                      "relative group bg-white border rounded-2xl p-2 transition-all hover:shadow-lg cursor-pointer",
                      selectedPreviewPages.includes(item.originalPageNum)
                        ? "border-[#4361ee] ring-2 ring-blue-100"
                        : "border-slate-100"
                    )}
                    onClick={() => togglePageSelection(item.originalPageNum)}
                  >
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          selectedPreviewPages.includes(item.originalPageNum)
                            ? "bg-[#4361ee] border-[#4361ee]"
                            : "bg-white border-slate-200"
                        )}
                      >
                        {selectedPreviewPages.includes(item.originalPageNum) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                    </div>

                    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl mb-2 shadow-sm">
                      <img
                        src={item.src}
                        className="max-w-full max-h-full object-contain"
                        alt={`Page ${item.originalPageNum}`}
                        style={{
                          transform: `rotate(${item.currentRotation}deg) scaleX(${
                            item.currentFlippedH ? -1 : 1
                          }) scaleY(${item.currentFlippedV ? -1 : 1})`,
                          transition: "transform 0.2s ease-in-out",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>Page {idx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            movePage(idx, -1);
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-blue-100 rounded disabled:opacity-30"
                          aria-label="Move page up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            movePage(idx, 1);
                          }}
                          disabled={idx === previews.length - 1}
                          className="p-1 hover:bg-blue-100 rounded disabled:opacity-30"
                          aria-label="Move page down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => deletePage(idx)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded"
                          aria-label="Delete page"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
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
              <RefreshCcw size={16} />Actions
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* eslint-disable-next-line no-unused-vars */}
              {ACTIONS.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => handlePreviewAction(id)}
                  disabled={!file || loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300",
                    file && !loading
                      ? "border-slate-50 bg-slate-50/30 text-[#1a1a2e] hover:border-[#4361ee] hover:bg-white hover:shadow-2xl active:scale-95"
                      : "border-slate-50 bg-slate-50/10 text-slate-300 cursor-not-allowed opacity-40"
                  )}
                  aria-label={label}
                >
                  <Icon
                    size={24}
                    className={
                      file && !loading
                        ? "text-[#4361ee] group-hover:scale-110 transition-transform"
                        : ""
                    }
                  />
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-tight leading-none mb-1">
                      {label}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">
                      {scopeLabel}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mb-4">
              <button
                onClick={resetPreviewTransforms}
                disabled={!file || loading}
                className="w-full py-2 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <RefreshCcw size={14} className="inline-block mr-2" />
                Reset All Transformations
              </button>
            </div>

            <button
              onClick={transformAndDownload}
              disabled={!file || loading}
              className="w-full mt-4 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3 rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Apply Changes & Generate PDF"}
            </button>

            {loading && (
              <div className="space-y-3 p-2">
                <div className="flex items-center justify-between text-[10px] font-black text-[#4361ee] uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <RefreshCcw size={12} className="animate-spin" /> Processing
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-[#4361ee]"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {resultUrl && !loading && (
              <div className="mt-4 p-5 bg-[#f0f9ff] border border-blue-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase">
                  <CheckCircle2 size={16} />
                  Ready for download
                </div>
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  href={resultUrl}
                  download={`${file?.name.replace(/\.pdf$/i, "")}_transformed.pdf`}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-6 rounded-xl font-bold shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)] transition-all"
                >
                  <Download size={20} />
                  DOWNLOAD PDF
                </motion.a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}