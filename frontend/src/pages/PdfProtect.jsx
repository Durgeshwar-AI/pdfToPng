import { useState, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadArea from '../components/FileUploadArea';
import { FileText, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import {
  toastError,
  toastSuccess,
  toastLoading,
  toastDismiss,
  parseApiError,
} from '../utils/toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function PdfProtect() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateFile = useCallback(selectedFile => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(
          1
        )} KB)`,
      };
    }
    return {
      isValid: false,
      message: 'Error: Please select a PDF file',
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

  const handleClearAll = e => {
    handleClear(e);
    setPassword('');
    setConfirmPassword('');
  };

  const validatePassword = () => {
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 4) {
      return 'Password must be at least 4 characters long.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      toastError('Please select a PDF file first.');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      toastError(passwordError);
      return;
    }

    setLoading(true);
    const loadingId = toastLoading(`Protecting "${file.name}"…`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const response = await fetch(`${BACKEND_URL}/protect-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = file.name.replace(/\.pdf$/i, '');
        a.download = `${baseName}_protected.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess('Your protected PDF has been downloaded!');
        // Clear passwords for safety
        setPassword('');
        setConfirmPassword('');
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
    <div className="theme-panel mx-auto flex w-full max-w-[700px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        Protect PDF
      </h1>

      <p className="-mt-6 mb-8 text-sm text-gray-500">
        Encrypt and password-protect your PDF files.
      </p>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center">
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
          inputId="pdf-protect-input"
          defaultIcon={<FileText className="h-16 w-16" />}
          defaultText="Upload a PDF to protect"
          supportText="Protects and encrypts your PDF document"
        />

        {file && (
          <div className="mb-6 w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Lock className="h-4 w-4 text-[#4361ee]" />
              Encryption Options
            </p>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Password Field */}
              <label className="relative flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Choose Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {/* Confirm Password Field */}
              <label className="relative flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Confirm Password
                </span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>
            </div>

            {/* Warning Box */}
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <span className="font-bold">Important security warning:</span> We do not store your
                password and cannot recover it. Make sure to keep it in a safe place.
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="mx-auto w-full max-w-[300px] cursor-pointer rounded-lg border-none bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-8 py-3.5 text-lg font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:cursor-not-allowed disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="mr-2.5 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.3)] border-t-white"></span>
              Protecting...
            </>
          ) : (
            'Protect PDF'
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfProtect;
