import { useState, useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { toastError, toastLoading, toastDismiss } from "../utils/toast";
import {
  FileText,
  Copy,
  Check,
  ShieldAlert,
  Shield,
  Hash,
  HardDrive,
  BookOpen,
  FileDigit,
  LayoutGrid,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── helpers ────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function InfoCard({ icon, label, value, highlight = false }) {
  return (
    <div
      className={`flex flex-col gap-1.5 p-4 rounded-xl border ${
        highlight
          ? "bg-[#4361ee]/5 border-[#4361ee]/20"
          : "bg-white border-gray-100"
      } shadow-sm`}
    >
      <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {icon}
        {label}
      </span>
      <span
        className={`text-2xl font-extrabold ${
          highlight ? "text-[#4361ee]" : "text-[#1a1a2e]"
        } leading-none`}
      >
        {value}
      </span>
    </div>
  );
}

// ── main component ──────────────────────────────────────────────────────────
function PdfInfo() {
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `"${selectedFile.name}" selected (${formatBytes(selectedFile.size)})`,
      };
    }
    return { isValid: false, message: "Error: Please select a PDF file" };
  }, []);

  const {
    file,
    loading,
    setLoading,
    isDragging,
    fileInputRef,
    dropAreaRef,
    handleFileChange,
    handleClear,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAreaClick,
  } = useFileUpload(validateFile);

  const handleClearAll = (e) => {
    handleClear(e);
    setInfo(null);
  };

  const handleCopyPageCount = () => {
    if (!info) return;
    navigator.clipboard.writeText(String(info.page_count)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toastError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setInfo(null);
    const loadingId = toastLoading(`Analysing "${file.name}"…`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/pdf-info`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInfo(data);
        toastDismiss(loadingId);
      } else {
        toastDismiss(loadingId);
        toastError(data.error || "Failed to read PDF info.");
      }
    } catch (err) {
      toastDismiss(loadingId);
      toastError(err.message || "Could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  // Build unique page sizes summary (e.g. "A4 (portrait) × 12")
  const pageSizeSummary = info
    ? (() => {
        const counts = {};
        for (const p of info.pages) {
          const key = `${p.size_name} (${p.orientation})`;
          counts[key] = (counts[key] || 0) + 1;
        }
        return Object.entries(counts)
          .map(([k, v]) => (info.page_count > 1 ? `${k} × ${v}` : k))
          .join(", ");
      })()
    : null;

  const firstPage = info?.pages?.[0];

  return (
    <div className="w-full max-w-[700px] mx-auto p-10 text-center flex flex-col justify-center items-center theme-panel rounded-2xl overflow-hidden">
      {/* Title */}
      <h1 className="mb-10 text-[var(--color-app-text)] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        PDF Info
      </h1>
      <p className="text-gray-500 text-sm mb-8 -mt-6">
        Instantly see page count, file size, dimensions and more — no conversion needed.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={handleClearAll}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept=".pdf,application/pdf"
          inputId="pdf-info-input"
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a PDF to inspect"
          supportText="No modifications — read-only analysis"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto mt-2 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5" />
              Analysing…
            </>
          ) : (
            "Inspect PDF"
          )}
        </button>

      </form>

      {/* ── Results panel ─────────────────────────────────────────────── */}
      {info && (
        <div className="w-full mt-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* File name */}
          <p className="text-xs text-gray-400 font-mono mb-4 truncate" title={info.file_name}>
            📄 {info.file_name}
          </p>

          {/* Primary stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {/* Page count — highlighted + copy button */}
            <div className="flex flex-col gap-1.5 p-4 rounded-xl border bg-[#4361ee]/5 border-[#4361ee]/20 shadow-sm sm:col-span-1 relative">
              <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                <Hash className="w-3.5 h-3.5" />
                Pages
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-[#4361ee] leading-none">
                  {info.page_count}
                </span>
                <button
                  onClick={handleCopyPageCount}
                  title="Copy page count"
                  className="ml-auto p-1.5 rounded-lg hover:bg-[#4361ee]/10 text-[#4361ee] transition-colors"
                  id="copy-page-count-btn"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <InfoCard
              icon={<HardDrive className="w-3.5 h-3.5" />}
              label="File Size"
              value={formatBytes(info.file_size_bytes)}
	      highlight={false}
            />

            <InfoCard
              icon={<FileDigit className="w-3.5 h-3.5" />}
              label="PDF Version"
              value={info.pdf_version}
            />

            <InfoCard
              icon={<LayoutGrid className="w-3.5 h-3.5" />}
              label="Page Size"
              value={firstPage ? `${firstPage.width_mm} × ${firstPage.height_mm} mm` : "—"}
            />

            <InfoCard
              icon={<BookOpen className="w-3.5 h-3.5" />}
              label="Size Name"
              value={pageSizeSummary || "—"}
            />

            {/* Encrypted badge */}
            <div
              className={`flex flex-col gap-1.5 p-4 rounded-xl border shadow-sm ${
                info.is_encrypted
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                {info.is_encrypted ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                )}
                Encrypted
              </span>
              <span
                className={`text-2xl font-extrabold leading-none ${
                  info.is_encrypted ? "text-red-500" : "text-emerald-600"
                }`}
              >
                {info.is_encrypted ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {/* Per-page breakdown (if multiple page sizes exist) */}
          {info.pages.length > 1 && (
            <details className="w-full mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none mb-2">
                View all {info.pages.length} page dimensions
              </summary>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-gray-500 font-semibold">#</th>
                      <th className="px-3 py-2 text-gray-500 font-semibold">Size</th>
                      <th className="px-3 py-2 text-gray-500 font-semibold">W × H (mm)</th>
                      <th className="px-3 py-2 text-gray-500 font-semibold">Orientation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.pages.map((p) => (
                      <tr key={p.page} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-400">{p.page}</td>
                        <td className="px-3 py-1.5 text-[#4361ee] font-semibold">{p.size_name}</td>
                        <td className="px-3 py-1.5 text-gray-600">
                          {p.width_mm} × {p.height_mm}
                        </td>
                        <td className="px-3 py-1.5 text-gray-500 capitalize">{p.orientation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {/* Inspect another */}
          <button
            onClick={handleClearAll}
            className="mt-5 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Inspect another PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default PdfInfo;
