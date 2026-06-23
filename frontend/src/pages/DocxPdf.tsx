import { useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText } from "lucide-react";
import { toastError, toastSuccess, toastLoading, toastDismiss, parseApiError } from "../utils/toast";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function DocxPdf() {
  const validateFile = useCallback((selectedFile) => {
    const accepted = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (selectedFile && accepted.includes(selectedFile.type)) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Please select a valid .docx or .doc file.",
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
      toastError("Please select a DOCX file first.");
      return;
    }

    setLoading(true);
    const loadingId = toastLoading(`Converting "${file.name}" to PDF…`);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/convertDocxToPdf`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.(docx|doc)$/i, ".pdf");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess("Your PDF has been downloaded!");
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
        DOCX to PDF
      </h1>

      <p className="text-gray-500 text-sm mb-8 -mt-6">Upload a .docx file to convert it to PDF.</p>

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
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          inputId="docx-pdf-input"
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a DOCX to convert"
          supportText="Converts DOCX to PDF on the server"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Converting…
            </>
          ) : (
            "Convert to PDF"
          )}
        </button>
      </form>
    </div>
  );
}

export default DocxPdf;
