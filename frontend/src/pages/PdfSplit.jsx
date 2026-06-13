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

      const viewport = page.getViewport({
        scale: 0.3,
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      thumbs.push({
        pageNum: i,
        src: canvas.toDataURL(),
      });
    }

    setPreviews(thumbs);
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

    try {
      const bytes = await f.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: bytes,
      }).promise;

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

      const copiedPages = await newPdf.copyPages(
        originalPdf,
        Array.from({ length: endIdx - startIdx + 1 }, (_, i) => startIdx + i),
      );

      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setResultUrl(url);

      toast.success(`Pages ${startPage}-${endPage} extracted successfully`);
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
    <div className="w-full max-w-6xl mx-auto p-8">
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

                  <p className="text-sm text-slate-500">{totalPages} pages</p>
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
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto">
                {previews.map((page) => (
                  <div
                    key={page.pageNum}
                    className={cn(
                      "border rounded-xl p-2",
                      isPageInRange(page.pageNum)
                        ? "border-blue-500"
                        : "opacity-50",
                    )}
                  >
                    <img src={page.src} alt={`Page ${page.pageNum}`} />

                    <p className="text-center text-xs mt-2">
                      Page {page.pageNum}
                    </p>
                  </div>
                ))}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-blue-50 rounded-2xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} />
                  Ready for download
                </div>

                <a
                  href={resultUrl}
                  download={`${file?.name.replace(
                    /\.pdf$/i,
                    "",
                  )}_${startPage}-${endPage}.pdf`}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
