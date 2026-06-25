import { useState, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText, Tags, Trash2, Download } from "lucide-react";
import { toastSuccess, toastError, toastLoading, toastDismiss } from "../utils/toast";
import { useHistory } from "../context/HistoryContext";

function PdfMetadata() {
  const { addToHistory } = useHistory();
  const [metadata, setMetadata] = useState({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "",
    producer: "",
  });

  const [pdfDocInstance, setPdfDocInstance] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((selectedFile) => {
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
      message: "Error: Please select a PDF file",
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

  useEffect(() => {
    if (!file) {
      setMetadata({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
      setPdfDocInstance(null);
      return;
    }

    const loadPdfMetadata = async () => {
      setLoading(true);
      const loadingId = toastLoading("Reading document properties...");
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setMetadata({
          title: pdfDoc.getTitle() || "",
          author: pdfDoc.getAuthor() || "",
          subject: pdfDoc.getSubject() || "",
          keywords: pdfDoc.getKeywords() || "",
          creator: pdfDoc.getCreator() || "",
          producer: pdfDoc.getProducer() || "",
        });
        setPdfDocInstance(pdfDoc);
        toastDismiss(loadingId);
      } catch (err) {
        toastDismiss(loadingId);
        if (err.message && err.message.toLowerCase().includes("encrypted")) {
          toastError("The uploaded PDF is password protected and cannot be read.");
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
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearAllFields = () => {
    setMetadata({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
  };

  const handleClearAll = (e) => {
    handleClear(e);
    setMetadata({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
    setPdfDocInstance(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !pdfDocInstance) {
      toastError("Please select a valid PDF file first");
      return;
    }

    setIsProcessing(true);
    const loadingId = toastLoading("Applying modifications...");

    try {
      pdfDocInstance.setTitle(metadata.title || "");
      pdfDocInstance.setAuthor(metadata.author || "");
      pdfDocInstance.setSubject(metadata.subject || "");
      const keywordArray = metadata.keywords
        ? metadata.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];
      pdfDocInstance.setKeywords(keywordArray);
      pdfDocInstance.setCreator(metadata.creator || "");
      pdfDocInstance.setProducer(metadata.producer || "");
      pdfDocInstance.setModificationDate(new Date());

      const pdfBytes = await pdfDocInstance.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      const downloadName = `${baseName}_metadata_updated.pdf`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toastDismiss(loadingId);
      toastSuccess("Your updated PDF has been downloaded!");

      const historyUrl = window.URL.createObjectURL(blob);
      addToHistory({
        fileName: file.name,
        conversionType: "PDF Metadata Editor",
        downloadUrl: historyUrl,
        downloadName: downloadName,
      });
    } catch (err) {
      toastDismiss(loadingId);
      toastError(err.message || "Failed to update PDF metadata.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 text-center flex flex-col justify-center items-center theme-panel rounded-2xl overflow-hidden">
      <h1 className="mb-10 text-[var(--color-app-text)] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        PDF Metadata Editor
      </h1>

      <p className="text-gray-500 text-sm mb-8 -mt-6">
        View, edit, or strip metadata properties from your PDF documents client-side.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
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
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a PDF file to edit"
          supportText="Loads and edits metadata entirely in the browser"
        />

        {file && pdfDocInstance && (
          <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tags className="w-4 h-4 text-[#4361ee]" />
                Edit Document Properties
              </p>
              <button
                type="button"
                onClick={handleClearAllFields}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sanitize (Clear All)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: "title", label: "Title", placeholder: "e.g. Annual Report" },
                { field: "author", label: "Author", placeholder: "e.g. John Doe" },
                { field: "subject", label: "Subject", placeholder: "e.g. Business Report" },
                { field: "keywords", label: "Keywords", placeholder: "e.g. report, annual (comma separated)" },
                { field: "creator", label: "Creator (App used to create)", placeholder: "e.g. Microsoft Word" },
                { field: "producer", label: "Producer (PDF Converter used)", placeholder: "e.g. Mac OS X Quartz" },
              ].map(({ field, label, placeholder }) => (
                <label key={field} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
                  <input
                    type="text"
                    value={metadata[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !pdfDocInstance || loading || isProcessing}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
        >
          {loading || isProcessing ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
              Processing...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-1" />
              Save & Download PDF
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default PdfMetadata;