import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
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
  Files,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Convert a single PDF File into one PNG per page.
// Returns { name, pages: [{ name, blob }] }.
async function convertPdfToPngs(file, scale, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
  const baseName = file.name.replace(/\.pdf$/i, '');
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
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

  const addFiles = fileList => {
    const pdfs = Array.from(fileList).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfs.length === 0) {
      setError('Please select PDF files only.');
      return;
    }
    setError(null);
    setZipUrl(null);
    setFiles(prev => [...prev, ...pdfs]);
  };

  const removeFile = idx => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setFiles([]);
    setError(null);
    setZipUrl(url => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  };

  const runBatch = async () => {
    if (files.length === 0 || loading) return;

    setLoading(true);
    setError(null);
    setZipUrl(url => {
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
        const pdf = await pdfjsLib.getDocument({ data: buf, verbosity: 0 }).promise;
        perFileCounts.push(pdf.numPages);
        totalPages += pdf.numPages;
      }
    } catch (e) {
      setError('Could not read one of the PDFs: ' + (e.message || String(e)));
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
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(zipBlob));
      toast.success(
        `Batch complete! ${files.length} PDF${files.length > 1 ? 's' : ''} converted to PNGs.`
      );
    } catch (e) {
      console.error(e);
      setError('Batch conversion failed: ' + (e.message || String(e)));
      toast.error(e.message || 'Batch failed');
    } finally {
      setLoading(false);
      setFileProgress(0);
    }
  };

  const totalPdfs = files.length;

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 text-center shadow-xl md:p-10">
      <Toaster position="top-right" richColors />

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-5xl font-extrabold tracking-tight text-[#1a1a2e]"
      >
        Batch PDF to PNG
      </motion.h1>

      <p className="mb-10 max-w-xl text-base leading-relaxed text-slate-500">
        Convert multiple PDF files to PNG images at once, then download all the results as a single
        ZIP archive.
      </p>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="space-y-6 text-left">
          <div
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all duration-300',
              isDragging
                ? 'scale-[1.03] border-[#4361ee] bg-blue-50 shadow-lg'
                : 'border-slate-200 bg-slate-50/50 hover:border-[#4361ee] hover:bg-white hover:shadow-xl'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={e => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Files size={24} />
              </div>
              <p className="text-sm font-bold text-[#1a1a2e]">
                Click or drag &amp; drop multiple PDFs
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Select several files for bulk conversion
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase">
                  <FileText size={16} /> {files.length} file
                  {files.length > 1 ? 's' : ''} queued
                </div>
                <button
                  onClick={clearAll}
                  className="text-[10px] font-bold text-gray-500 uppercase transition-colors hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>

              <ul className="max-h-[300px] space-y-2 overflow-y-auto">
                {files.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1a1a2e]">{f.name}</p>
                      <p className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="rounded-full p-2 text-red-500 hover:bg-red-100"
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
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-left shadow-sm">
            <div className="mb-6 flex items-center gap-2 text-sm font-bold tracking-wider text-[#1a1a2e] uppercase">
              <RefreshCcw size={16} /> Settings &amp; Convert
            </div>

            <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase">
              Image Scale (quality)
            </label>
            <select
              value={scale}
              onChange={e => setScale(Number(e.target.value))}
              disabled={loading}
              className="mb-6 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-[#1a1a2e] focus:border-[#4361ee] focus:outline-none"
            >
              <option value={1}>1x (faster, smaller)</option>
              <option value={2}>2x (balanced)</option>
              <option value={3}>3x (higher quality)</option>
            </select>

            <button
              onClick={runBatch}
              disabled={files.length === 0 || loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#4361ee] to-[#3b82f6] py-3 font-bold text-white shadow-lg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Converting...'
                : `Convert ${totalPdfs > 0 ? totalPdfs + ' PDF' + (totalPdfs > 1 ? 's' : '') : ''}`}
            </button>

            {loading && (
              <div className="mt-4 space-y-3 p-2">
                {currentFile && (
                  <p className="truncate text-xs font-bold text-[#1a1a2e]">
                    <span className="text-[#4361ee]">Now:</span> {currentFile}{' '}
                    <span className="text-slate-400">({fileProgress}%)</span>
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-[#4361ee] uppercase">
                  <span className="flex items-center gap-2">
                    <RefreshCcw size={12} className="animate-spin" /> Overall
                  </span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-[#4361ee]"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-500">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {zipUrl && !loading && (
              <div className="mt-4 space-y-4 rounded-2xl border border-blue-100 bg-[#f0f9ff] p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase">
                  <CheckCircle2 size={16} />
                  ZIP ready for download
                </div>
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  href={zipUrl}
                  download="pdf-to-png-batch.zip"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition-all hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)]"
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
