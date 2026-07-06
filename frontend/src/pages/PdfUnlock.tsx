import { useState, useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText, Unlock, Eye, EyeOff } from "lucide-react";
import { toastError, toastSuccess, toastLoading, toastDismiss, parseApiError } from "../utils/toast";
import { useHistory } from "../context/HistoryContext";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PdfUnlock() {
  const { addToHistory } = useHistory();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: "Error: Please select a PDF file" };
  }, []);

  const {
    file, loading, setLoading, isDragging,
    fileInputRef, dropAreaRef, handleFileChange, handleClear,
    handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleAreaClick,
  } = useFileUpload(validateFile);

  const handleClearAll = (e) => {
    handleClear(e);
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toastError("Please select a PDF file first."); return; }
    if (!password) { toastError("Please enter the PDF password."); return; }

    setLoading(true);
    const loadingId = toastLoading(`Unlocking "${file.name}"...`);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await fetch(`${BACKEND_URL}/unlock-pdf`, { method: "POST", body: formData });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const baseName = file.name.replace(/\.pdf$/i, "");
        const downloadName = `${baseName}_unlocked.pdf`;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess("Your unlocked PDF has been downloaded!");
        setPassword("");

        const historyUrl = window.URL.createObjectURL(blob);
        addToHistory({
          fileName: file.name,
          conversionType: "Unlock PDF",
          downloadUrl: historyUrl,
          downloadName: downloadName,
        });
      } else {
        const errorMsg = await parseApiError(null, response);
        toastDismiss(loadingId);
        toastError(`Failed to unlock PDF: ${errorMsg}`);
      }
    } catch (error) {
      toastDismiss(loadingId);
      toastError(await parseApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white dark:from-[#0f172a] dark:to-[#111827] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] dark:text-white text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Unlock PDF
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 -mt-6">Remove password protection from your PDF files.</p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file} isDragging={isDragging} fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef} handleFileChange={handleFileChange}
          handleClear={handleClearAll} handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver} handleDragLeave={handleDragLeave}
          handleDrop={handleDrop} handleAreaClick={handleAreaClick}
          accept=".pdf,application/pdf" inputId="pdf-unlock-input"
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a password-protected PDF"
          supportText="Removes password protection from your PDF"
        />

        {file && (
          <div className="w-full mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm text-left">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-[#4361ee]" />
              Enter PDF Password
            </p>
            <label className="flex flex-col gap-1.5 relative">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-[#1a1a2e] dark:text-white text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
          </div>
        )}

        <button type="submit" disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none">
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Unlocking...
            </>
          ) : "Unlock PDF"}
        </button>
      </form>
    </div>
  );
}

export default PdfUnlock;