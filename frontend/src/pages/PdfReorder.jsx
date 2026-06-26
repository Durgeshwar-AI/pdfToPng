import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { PDFDocument } from 'pdf-lib';
import { Toaster, toast } from 'sonner';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PdfReorder() {
  // State
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [pages, setPages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [pageLimitWarning, setPageLimitWarning] = useState(false);
  const [deletedPages, setDeletedPages] = useState([]);

  // Refs
  const inputRef = useRef(null);

  // Revoke any generated object URL when it changes / on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  // Render each page to a small canvas thumbnail
  const generateThumbnails = async pdf => {
    const thumbs = [];
    const limit = Math.min(pdf.numPages, 50);

    for (let i = 1; i <= limit; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      thumbs.push({
        originalPageNum: i,
        src: canvas.toDataURL(),
      });
    }

    setPages(thumbs);
  };

  const pickFile = async f => {
    if (!f) return;

    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return;
    }

    setFile(f);
    setResultUrl(null);
    setError(null);
    setPages([]);
    setPageLimitWarning(false);
    setDeletedPages([]);

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: bytes,
        verbosity: 0,
      }).promise;
      setTotalPages(pdf.numPages);

      if (pdf.numPages > 50) {
        setPageLimitWarning(true);
      }

      await generateThumbnails(pdf);
    } catch {
      setTotalPages(null);
      setError('Unable to read PDF page count.');
    }
  };

  // ── Drag-to-reorder handlers ──────────────────────────────────────────
  const handleDragStart = index => {
    setDragIndex(index);
  };

  const handleDragEnter = index => {
    setOverIndex(index);
    if (dragIndex === null || dragIndex === index) return;
    setPages(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // Keyboard fallback: move a page up/down with arrow buttons
  const movePage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;
    setPages(prev => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  };

  const deletePage = index => {
    const deletedPage = pages[index];

    setDeletedPages(prev => [
      ...prev,
      {
        page: deletedPage,
        index,
      },
    ]);

    setPages(prev => prev.filter((_, i) => i !== index));
  };

  //Undo Function

  const undoDelete = () => {
    if (deletedPages.length === 0) return;

    const lastDeleted = deletedPages[deletedPages.length - 1];

    setPages(prev => {
      const next = [...prev];
      next.splice(lastDeleted.index, 0, lastDeleted.page);
      return next;
    });

    setDeletedPages(prev => prev.slice(0, -1));
  };

  const resetOrder = () => {
    if (!file) return;
    setPages(prev => [...prev].sort((a, b) => a.originalPageNum - b.originalPageNum));
  };

  const reorderAndDownload = async () => {
    if (!file || loading) return;
    if (pages.length === 0) {
      setError('No pages to process. Please upload a PDF.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      const total = pages.length;

      for (let i = 0; i < pages.length; i++) {
        const originalIndex = pages[i].originalPageNum - 1;
        const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [originalIndex]);
        newPdfDoc.addPage(copiedPage);
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      toast.success('PDF reordered successfully!');
    } catch (e) {
      console.error(e);
      setError('Processing failed: ' + (e.message || String(e)));
      toast.error(e.message || 'Unknown error');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 text-center shadow-xl md:p-10 dark:border-slate-700 dark:from-[#0f172a] dark:to-[#1e293b]">
      <Toaster position="top-right" richColors />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-5xl font-extrabold tracking-tight text-[#1a1a2e] dark:text-white"
      >
        PDF Reorder Pages
      </motion.h1>

      <p className="mb-10 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
        Drag and drop page thumbnails to reorder your PDF, then download the new document in your
        chosen order.
      </p>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="space-y-6 text-left">
          <div
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              pickFile(e.dataTransfer.files[0]);
            }}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all duration-300 dark:border-slate-700',
              isDragging
                ? 'scale-[1.03] border-[#4361ee] bg-blue-50 shadow-lg dark:bg-slate-800'
                : 'border-slate-200 bg-slate-50/50 hover:border-[#4361ee] hover:bg-white hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => pickFile(e.target.files?.[0] || null)}
            />

            {file ? (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="max-w-[200px] truncate text-sm font-bold text-[#1a1a2e] dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{totalPages} pages</p>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setFile(null);
                    setPages([]);
                    setPageLimitWarning(false);
                    setDeletedPages([]);
                  }}
                  className="ml-4 rounded-full p-2 text-red-500 hover:bg-red-100"
                  aria-label="Remove file"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-300">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-[#1a1a2e] dark:text-white">
                  Click or drag &amp; drop a PDF
                </p>
              </div>
            )}
          </div>

          {pageLimitWarning && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-yellow-50 p-4 text-sm font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              <AlertCircle size={16} />
              This PDF contains more than 50 pages. Please upload a PDF with 50 pages or fewer.
            </div>
          )}

          {pages.length > 0 && (
            <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase dark:text-white">
                  <GripVertical size={16} /> Drag to Reorder
                </div>
                <button
                  onClick={resetOrder}
                  className="text-[10px] font-bold text-gray-500 uppercase transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  Reset Order
                </button>
                <button
                  onClick={undoDelete}
                  disabled={deletedPages.length === 0}
                  className="text-[10px] font-bold text-gray-500 uppercase transition-colors hover:text-gray-700 disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
                >
                  Undo Delete
                </button>
              </div>

              <div className="grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto p-2 sm:grid-cols-3">
                {pages.map((item, idx) => (
                  <div
                    key={item.originalPageNum}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragOver={e => e.preventDefault()}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'group relative cursor-grab rounded-2xl border bg-white p-2 transition-all active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900',
                      overIndex === idx
                        ? 'scale-[1.02] border-[#4361ee] ring-2 ring-blue-200/60'
                        : 'border-slate-100 hover:shadow-lg dark:border-slate-800',
                      dragIndex === idx && 'opacity-50'
                    )}
                  >
                    <div className="pointer-events-none absolute top-2 left-2 z-10 text-[10px] font-bold text-slate-400">
                      <GripVertical size={14} />
                    </div>

                    <div className="relative mb-2 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl shadow-sm">
                      <img
                        src={item.src}
                        className="max-h-full max-w-full object-contain"
                        alt={`Page ${item.originalPageNum}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Page {idx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePage(idx, -1)}
                          disabled={idx === 0}
                          className="rounded p-1 hover:bg-blue-100 disabled:opacity-30"
                          aria-label="Move page earlier"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePage(idx, 1)}
                          disabled={idx === pages.length - 1}
                          className="rounded p-1 hover:bg-blue-100 disabled:opacity-30"
                          aria-label="Move page later"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => deletePage(idx)}
                          className="rounded p-1 text-red-500 hover:bg-red-100"
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
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-6 flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase dark:text-white">
              <RefreshCcw size={16} /> Actions
            </div>

            <button
              onClick={reorderAndDownload}
              disabled={!file || loading || pages.length === 0}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#4361ee] to-[#3b82f6] py-3 font-bold text-white shadow-lg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Reorder & Generate PDF'}
            </button>

            {loading && (
              <div className="space-y-3 p-2">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-[#4361ee] uppercase">
                  <span className="flex items-center gap-2">
                    <RefreshCcw size={12} className="animate-spin" /> Processing
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-[#4361ee]"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-500 dark:bg-red-950/30">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {resultUrl && !loading && (
              <div className="mt-4 space-y-4 rounded-2xl border border-blue-100 bg-[#f0f9ff] p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase dark:text-blue-200">
                  <CheckCircle2 size={16} />
                  Ready for download
                </div>
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  href={resultUrl}
                  download={`${file?.name.replace(/\.pdf$/i, '')}_reordered.pdf`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition-all hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)]"
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
