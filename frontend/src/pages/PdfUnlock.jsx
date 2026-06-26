import { useState, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadArea from '../components/FileUploadArea';
import { FileText, Unlock, Eye, EyeOff } from 'lucide-react';
import {
  toastError,
  toastSuccess,
  toastLoading,
  toastDismiss,
  parseApiError,
} from '../utils/toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function PdfUnlock() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateFile = useCallback(selectedFile => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: 'Error: Please select a PDF file' };
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
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      toastError('Please select a PDF file first.');
      return;
    }
    if (!password) {
      toastError('Please enter the PDF password.');
      return;
    }

    setLoading(true);
    const loadingId = toastLoading(`Unlocking "${file.name}"…`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const response = await fetch(`${BACKEND_URL}/unlock-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = file.name.replace(/\.pdf$/i, '');
        a.download = `${baseName}_unlocked.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess('Your unlocked PDF has been downloaded!');
        setPassword('');
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
    <div className="mx-auto flex w-full max-w-[750px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6f8fa] to-white p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:from-[#0f172a] dark:to-[#111827]">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[#1a1a2e] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-[''] dark:text-white">
        Unlock PDF
      </h1>

      <p className="-mt-6 mb-8 text-sm text-gray-500 dark:text-gray-400">
        Remove password protection from your PDF files.
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
          inputId="pdf-unlock-input"
          defaultIcon={<FileText className="h-16 w-16" />}
          defaultText="Upload a password-protected PDF"
          supportText="Removes password protection from your PDF"
        />

        {file && (
          <div className="mb-6 w-full rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Unlock className="h-4 w-4 text-[#4361ee]" />
              Enter PDF Password
            </p>
            <label className="relative flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
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
              Unlocking...
            </>
          ) : (
            'Unlock PDF'
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfUnlock;
