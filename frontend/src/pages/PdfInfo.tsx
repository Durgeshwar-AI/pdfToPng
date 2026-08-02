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
    .catch(err => console.error(err))