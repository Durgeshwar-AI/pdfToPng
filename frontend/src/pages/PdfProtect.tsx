import { useState, useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toastError, toastSuccess, toastLoading, toastDismiss, parseApiError } from "../utils/toast";
import { useHistory } from "../context/HistoryContext";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PdfProtect() {
  const { addToHistory } = useHistory();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    file, loading, setLoading, isDragging, fileInputRef, dropAreaRef,
    handleFileChange, handleClear, handleDragEnter, handleDragOver,
    handleDragLeave, handleDrop, handleAreaClick,
  } = useFileUpload(validateFile);

  const handleClearAll = (e) => {
    handleClear(e);
    setPassword("");
    setConfirmPassword("");
  };

  const validatePassword = () => {
    if (!password) return "Password is required.";
    if (password.length < 4) return "Password must be at least 4 characters long.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toastError("Please select a PDF file first."); return; }
    const passwordError = validatePassword();
    if (passwordError) { toastError(passwordError); return; }

    setLoading(true);
    const loadingId = toastLoading(`Protecting "${file.name}"...`);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("password", password);

    try {
      const response = await fetch(`${BACKEND_URL}/protect-pdf`, { method: "POST", body: formData });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const baseName = file.name.replace(/\.pdf$/i, "");
        const downloadName = `${baseName}_protected.pdf`;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess("Your protected PDF has been downloaded!");
        setPassword("");
        setConfirmPassword("");

        const historyUrl = window.URL.createObjectURL(blob);
        addToHistory({
          fileName: file.name,
          conversionType: "Protect PDF",
          downloadUrl: historyUrl,
          downloadName: downloadName,
        });
      } else {
        const errorMsg = await parseApiError(null, response);
        toastDismiss(loadingId);
        toastError(`Failed to protect PDF: ${errorMsg}`);
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
        Protect PDF
      </h1>
      <p className="text-gray-500 text-sm mb-8 -mt-6">Encrypt and password-protect your PDF files.</p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file} isDragging={isDragging} fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef} handleFileChange={handleFileChange}
          handleClear={handleClearAll} handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver} handleDragLeave={handleDragLeave}
          handleDrop={handleDrop} handleAreaClick={handleAreaClick}
          accept=".pdf,application/pdf" inputId="pdf-protect-input"
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a PDF to protect"
          supportText="Protects and encrypts your PDF document"
        />

        {file && (
          <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-left">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#4361ee]" />
              Encryption Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label className="flex flex-col gap-1.5 relative">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Choose Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>
              <label className="flex flex-col gap-1.5 relative">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Confirm Password</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </label>
            </div>
            <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Important security warning:</span> We do not store your password and cannot recover it. Make sure to keep it in a safe place.
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none">
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Protecting...
            </>
          ) : "Protect PDF"}
        </button>
      </form>
    </div>
  );
}

export default PdfProtect;