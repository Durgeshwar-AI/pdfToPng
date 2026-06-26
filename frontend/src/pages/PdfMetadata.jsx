import { useState, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadArea from '../components/FileUploadArea';
import { FileText, Tags, Trash2, Download } from 'lucide-react';
import { toastSuccess, toastError, toastLoading, toastDismiss } from '../utils/toast';

function PdfMetadata() {
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
  });

  const [pdfDocInstance, setPdfDocInstance] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Load PDF metadata when a new file is uploaded
  useEffect(() => {
    if (!file) {
      setMetadata({
        title: '',
        author: '',
        subject: '',
        keywords: '',
        creator: '',
        producer: '',
      });
      setPdfDocInstance(null);
      return;
    }

    const loadPdfMetadata = async () => {
      setLoading(true);
      const loadingId = toastLoading('Reading document properties…');
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        const title = pdfDoc.getTitle() || '';
        const author = pdfDoc.getAuthor() || '';
        const subject = pdfDoc.getSubject() || '';
        const keywords = pdfDoc.getKeywords() || '';
        const creator = pdfDoc.getCreator() || '';
        const producer = pdfDoc.getProducer() || '';

        setMetadata({ title, author, subject, keywords, creator, producer });
        setPdfDocInstance(pdfDoc);
        toastDismiss(loadingId);
      } catch (err) {
        console.error('Error parsing PDF metadata: ', err);
        toastDismiss(loadingId);
        if (err.message && err.message.toLowerCase().includes('encrypted')) {
          toastError('The uploaded PDF is password protected and cannot be read.');
        } else {
          toastError(`Error parsing PDF: ${err.message}`);
        }
        setPdfDocInstance(null);
      } finally {
        setLoading(false);
      }
    };

    loadPdfMetadata();
  }, [file, setLoading]);

  const handleInputChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleClearAllFields = () => {
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
    });
  };

  const handleClearAll = e => {
    handleClear(e);
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: '',
    });
    setPdfDocInstance(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file || !pdfDocInstance) {
      toastError('Please select a valid PDF file first');
      return;
    }

    setIsProcessing(true);
    const loadingId = toastLoading('Applying modifications…');

    try {
      // Set new metadata properties
      pdfDocInstance.setTitle(metadata.title || '');
      pdfDocInstance.setAuthor(metadata.author || '');
      pdfDocInstance.setSubject(metadata.subject || '');

      // Keywords are stored as an array of strings in pdf-lib
      const keywordArray = metadata.keywords
        ? metadata.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean)
        : [];
      pdfDocInstance.setKeywords(keywordArray);

      pdfDocInstance.setCreator(metadata.creator || '');
      pdfDocInstance.setProducer(metadata.producer || '');

      // Update modification date
      pdfDocInstance.setModificationDate(new Date());

      const pdfBytes = await pdfDocInstance.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const baseName = file.name.replace(/\.pdf$/i, '');
      a.download = `${baseName}_metadata_updated.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toastDismiss(loadingId);
      toastSuccess('Your updated PDF has been downloaded!');
    } catch (err) {
      toastDismiss(loadingId);
      toastError(err.message || 'Failed to update PDF metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="theme-panel mx-auto flex w-full max-w-[750px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        PDF Metadata Editor
      </h1>

      <p className="-mt-6 mb-8 text-sm text-gray-500">
        View, edit, or strip metadata properties from your PDF documents client-side.
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
          inputId="pdf-metadata-input"
          defaultIcon={<FileText className="h-16 w-16" />}
          defaultText="Upload a PDF file to edit"
          supportText="Loads and edits metadata entirely in the browser"
        />

        {file && pdfDocInstance && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-6 w-full rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm duration-300">
            <div className="mb-6 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tags className="h-4 w-4 text-[#4361ee]" />
                Edit Document Properties
              </p>
              <button
                type="button"
                onClick={handleClearAllFields}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-700"
                title="Clear all fields to strip metadata"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Sanitize (Clear All)
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Document Title */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Title
                </span>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Annual Report"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                />
              </label>

              {/* Author */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Author
                </span>
                <input
                  type="text"
                  value={metadata.author}
                  onChange={e => handleInputChange('author', e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                />
              </label>

              {/* Subject */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Subject
                </span>
                <input
                  type="text"
                  value={metadata.subject}
                  onChange={e => handleInputChange('subject', e.target.value)}
                  placeholder="e.g. Business Report"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                />
              </label>

              {/* Keywords */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Keywords
                </span>
                <input
                  type="text"
                  value={metadata.keywords}
                  onChange={e => handleInputChange('keywords', e.target.value)}
                  placeholder="e.g. report, annual, financial (comma separated)"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                />
              </label>

              {/* Creator */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Creator (App used to create)
                </span>
                <input
                  type="text"
                  value={metadata.creator}
                  onChange={e => handleInputChange('creator', e.target.value)}
                  placeholder="e.g. Microsoft Word"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                />
              </label>

              {/* Producer */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  Producer (PDF Converter used)
                </span>
                <input
                  type="text"
                  value={metadata.producer}
                  onChange={e => handleInputChange('producer', e.target.value)}
                  placeholder="e.g. Mac OS X 10.15 Quartz PDFContext"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !pdfDocInstance || loading || isProcessing}
          className="mx-auto flex w-full max-w-[300px] cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-8 py-3.5 text-lg font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:cursor-not-allowed disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:shadow-none"
        >
          {loading || isProcessing ? (
            <>
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.3)] border-t-white"></span>
              Processing...
            </>
          ) : (
            <>
              <Download className="mr-1 h-5 w-5" />
              Save & Download PDF
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfMetadata;
