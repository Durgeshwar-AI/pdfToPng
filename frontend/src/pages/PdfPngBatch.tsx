import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import JSZip from "jszip";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  Files,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import PrimaryButton from "../components/PrimaryButton";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Convert a single PDF File into one PNG per page.
// Returns { name, pages: [{ name, blob }] }.
async function convertPdfToPngs(file, scale, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 })
    .promise;
  const baseName = file.name.replace(/\.pdf$/i, "");
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport, canvas: canvas }).promise;

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    pages.push({ name: `${baseName}-page-${i}.png`, blob });
    if (onProgress) onProgress(i, pdf.numPages);
  }

  return { name: baseName, pages };
}

export default function PdfPngBatch() {
  const [files, setFiles] = useState([]);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileProgress, setFileProgress] = useState(0); // pages done in current file
  const [overallProgress, setOverallProgress] = useState(0); // 0-100 across all files
  const [error, setError] = useState(null);
  const [zipUrl, setZipUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const pdfs = Array.from(fileList).filter(
      (f: any) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length === 0) {
      setError("Please select PDF files only.");
      return;
    }
    setError(null);
    setZipUrl(null);
    setFiles((prev) => [...prev, ...pdfs]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
    setZipUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  };

  const runBatch = async () => {
    if (files.length === 0 || loading) return;

    setLoading(true);
    setError(null);
    setZipUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setOverallProgress(0);

    // Pre-compute total page count for an honest overall progress bar.
    let totalPages = 0;
    const perFileCounts = [];
    try {
      for (const f of files) {
        const buf = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf, verbosity: 0 })
          .promise;
        perFileCounts.push(pdf.numPages);
        totalPages += pdf.numPages;
      }
    } catch (e) {
      setError("Could not read one of the PDFs: " + (e.message || String(e)));
      setLoading(false);
      return;
    }

    const zip = new JSZip();
    let done = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFile(files[i].name);
        setFileProgress(0);
        const result = await convertPdfToPngs(files[i], scale, (page, total) => {
          setFileProgress(Math.round((page / total) * 100));
        });
        // If a batch contains multiple files, namespace PNGs into a folder per file.
        const folder = files.length > 1 ? zip.folder(result.name) : zip;
        for (const p of result.pages) {
          folder.file(p.name, p.blob);
        }
        done += perFileCounts[i];
        setOverallProgress(Math.round((done / totalPages) * 100));
      }

      setCurrentFile(null);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(zipBlob));
      toast.success(
        `Batch complete! ${files.length} PDF${files.length > 1 ? "s" : ""} converted to PNGs.`
      );
    } catch (e) {
      console.error(e);
      setError("Batch conversion failed: " + (e.message || String(e)));
      toast.error(e.message || "Batch failed");
    } finally {
      setLoading(false);
      setFileProgress(0);
    }
  };

  const totalPdfs = files.length;

  return (
    <div className="w-full max-w-[1100px] mx-auto p-6 md:p-10 text-center flex flex-col items-center bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <Toaster position="top-right" richColors />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-[#1a1a2e] text-5xl font-extrabold tracking-tight"
      >
        Batch PDF to PNG
      </motion.h1>

      <p className="text-slate-500 mb-10 max-w-xl text-base leading-relaxed">
        Convert multiple PDF files to PNG images at once, then download all the
        results as a single ZIP archive.
      </p>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel */}
        <div className="space-y-6 text-left">
          <div
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
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
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <Files size={24} />
              </div>
              <p className="text-[#1a1a2e] font-bold text-sm">
                Click or drag &amp; drop multiple PDFs
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Select several files for bulk conversion
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
                  <FileText size={16} /> {files.length} file
                  {files.length > 1 ? "s" : ""} queued
                </div>
                <button
                  onClick={clearAll}
                  className="text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase transition-colors"
                >
                  Clear All
                </button>
              </div>

              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {files.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1a1a2e] font-bold text-sm truncate">
                        {f.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {(f.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                      aria-label={`Remove ${f.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-6">
              <RefreshCcw size={16} /> Settings &amp; Convert
            </div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Image Scale (quality)
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              disabled={loading}
              className="w-full mb-6 p-3 rounded-xl border border-slate-200 text-sm font-bold text-[#1a1a2e] focus:outline-none focus:border-[#4361ee]"
            >
              <option value={1}>1x (faster, smaller)</option>
              <option value={2}>2x (balanced)</option>
              <option value={3}>3x (higher quality)</option>
            </select>

            <PrimaryButton
              onClick={runBatch}
              disabled={files.length === 0 || loading}
              className="max-w-none"
            >
              {loading
                ? "Converting..."
                : `Convert ${totalPdfs > 0 ? totalPdfs + " PDF" + (totalPdfs > 1 ? "s" : "") : ""}`}
            </PrimaryButton>

            {loading && (
              <div className="space-y-3 p-2 mt-4">
                {currentFile && (
                  <p className="text-xs font-bold text-[#1a1a2e] truncate">
                    <span className="text-[#4361ee]">Now:</span> {currentFile}{" "}
                    <span className="text-slate-400">({fileProgress}%)</span>
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] font-black text-[#4361ee] uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <RefreshCcw size={12} className="animate-spin" /> Overall
                  </span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-[#4361ee]"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 mt-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {zipUrl && !loading && (
              <div className="mt-4 p-5 bg-[#f0f9ff] border border-blue-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase">
                  <CheckCircle2 size={16} />
                  ZIP ready for download
                </div>
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  href={zipUrl}
                  download="pdf-to-png-batch.zip"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-6 rounded-xl font-bold shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)] transition-all"
                >
                  <Download size={20} />
                  DOWNLOAD ZIP
                </motion.a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
