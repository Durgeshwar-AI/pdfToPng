import { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadArea from '../components/FileUploadArea';
import {
  FileText,
  Type,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { toastError, toastSuccess, toastInfo } from '../utils/toast';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PdfToText() {
  const [extractedText, setExtractedText] = useState('');
  const [hasSelectableText, setHasSelectableText] = useState(true);
  const [copied, setCopied] = useState(false);

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

  // Parse PDF text when a file is uploaded
  useEffect(() => {
    if (!file) {
      setExtractedText('');
      setHasSelectableText(true);
      setCopied(false);
      return;
    }

    let cancelled = false;
    const extractText = async () => {
      setLoading(true);
      toastInfo('Parsing document and extracting text…');
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        let hasAnyText = false;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          // Join text items on the page
          const pageText = textContent.items.map(item => item.str).join(' ');

          if (pageText.trim()) {
            hasAnyText = true;
          }

          fullText += `--- Page ${i} ---\n${pageText.trim() || '[No readable text on this page]'}\n\n`;
        }

        if (!cancelled) {
          setExtractedText(fullText.trim());
          setHasSelectableText(hasAnyText);
          if (hasAnyText) {
            toastSuccess('Text extracted successfully.');
          } else {
            toastInfo(
              'Extraction finished. Note: No selectable text was found — this may be a scanned PDF.'
            );
          }
        }
      } catch (err) {
        console.error('Error extracting text: ', err);
        if (!cancelled) {
          toastError(err.message || 'Failed to extract text from PDF.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    extractText();

    return () => {
      cancelled = true;
    };
  }, [file, setLoading]);

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toastSuccess('Text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = file.name.replace(/\.pdf$/i, '');
    a.download = `${baseName}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = e => {
    handleClear(e);
    setExtractedText('');
    setHasSelectableText(true);
    setCopied(false);
  };

  return (
    <div className="theme-panel mx-auto flex w-full max-w-[750px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        PDF to Text
      </h1>

      <p className="theme-muted -mt-6 mb-8 text-sm">
        Extract raw text content from digital/selectable PDF documents client-side.
      </p>

      <form className="flex w-full flex-col items-center" onSubmit={e => e.preventDefault()}>
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
          inputId="pdf-to-text-input"
          defaultIcon={<FileText className="h-16 w-16" />}
          defaultText="Upload a PDF to extract text"
          supportText="Reads text streams instantly inside the browser"
        />

        {file && !loading && extractedText && (
          <div className="theme-card animate-in fade-in slide-in-from-bottom-4 mb-6 w-full rounded-xl p-6 text-left shadow-sm duration-300">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-app-text)]">
                <Type className="h-4 w-4 text-[#4361ee]" />
                Extracted Text Preview
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    copied
                      ? 'border-green-200 bg-green-50 text-green-600'
                      : 'theme-card theme-muted hover:bg-[var(--color-app-surface-muted)] hover:text-[var(--color-app-text)]'
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="theme-card theme-muted flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:bg-[var(--color-app-surface-muted)] hover:text-[var(--color-app-text)]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .txt
                </button>
              </div>
            </div>

            {/* Scrollable Text Box */}
            <div className="max-h-[300px] w-full overflow-y-auto rounded-lg border border-[var(--color-app-border)] bg-[var(--color-app-surface-muted)] p-4 font-mono text-sm whitespace-pre-wrap text-[var(--color-app-text)] select-text">
              {extractedText}
            </div>

            {/* Fallback warning if no text was parsed */}
            {!hasSelectableText && (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <span className="font-bold">No selectable text found:</span> This document appears
                  to be scanned or contains only images of text. If so, please use the{' '}
                  <strong className="underline">Image OCR</strong> tool to perform character
                  recognition.
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <p className="theme-muted mt-4 flex animate-pulse items-center justify-center gap-2 text-[0.9rem]">
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-[#4361ee]" />
            Parsing document and extracting text…
          </p>
        )}
      </form>
    </div>
  );
}

export default PdfToText;
