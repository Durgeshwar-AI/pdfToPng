import { useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadArea from '../components/FileUploadArea';
import { FileText } from 'lucide-react';
import {
  toastError,
  toastSuccess,
  toastLoading,
  toastDismiss,
  parseApiError,
} from '../utils/toast';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function PdfDocx() {
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
      message: 'Please select a valid PDF file.',
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      toastError('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    const loadingId = toastLoading(`Converting "${file.name}" to Word…`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${BACKEND_URL}/convertDocx`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, '.docx');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingId);
        toastSuccess('Your Word document has been downloaded!');
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
    <div className="theme-panel mx-auto flex w-full max-w-[700px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        PDF to Word
      </h1>

      <p className="-mt-6 mb-8 text-sm text-gray-800">
        Text-based PDFs only. Scanned PDFs are not supported.
      </p>

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center">
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
          defaultIcon={<FileText className="h-16 w-16" />}
          defaultText="Upload a PDF to convert"
          supportText="Converts text-based PDFs to .docx"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="mx-auto w-full max-w-[300px] cursor-pointer rounded-lg border-none bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-8 py-3.5 text-lg font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:cursor-not-allowed disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="mr-2.5 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.3)] border-t-white"></span>
              Converting…
            </>
          ) : (
            'Convert to Word'
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfDocx;
