import { useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText } from "lucide-react";
import { toastError, toastSuccess, toastLoading, toastDismiss, parseApiError } from "../utils/toast";
import { useHistory } from "../context/HistoryContext";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PdfDocx() {

  const { addToHistory } = useHistory();
  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Please select a valid PDF file.",
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toastError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    const loadingId = toastLoading(`Converting "${file.name}" to Word...`);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/convertDocx`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const downloadName = file.name.replace(/\.pdf$/i, ".docx");
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess("Your Word document has been downloaded!");

        const historyUrl = window.URL.createObjectURL(blob);
        addToHistory({
          fileName: file.name,
          conversionType: "PDF to Word",
          downloadUrl: historyUrl,
          downloadName: downloadName,
        });
      } else {
        const errorMsg = await parseApiError(null, response);
        toastDismiss(loadingId);
        toastError(`Conversion failed: ${errorMsg}`);
      }
    } catch (error) {
      toastDismiss(loadingId);
      toastError(await parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto p-10 text-center flex flex-col justify-center items-center theme-panel rounded-2xl overflow-hidden">
      <h1 className="mb-10 text-[var(--color-app-text)] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        PDF to Word
      </h1>

      <p className="text-gray-800 text-sm mb-8 -mt-6">
        Text-based PDFs only. Scanned PDFs are not supported.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={handleClear}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept="application/pdf"
          inputId="pdf-docx-input"
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a PDF to convert"
          supportText="Converts text-based PDFs to .docx"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Converting...
            </>
          ) : (
            "Convert to Word"
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfDocx;
