import { useCallback, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  FileText,
  Loader2
} from "lucide-react";

function ImageOcr() {
  const [extractedText, setExtractedText] = useState("");
  const [copied, setCopied] = useState(false);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return { isValid: true, message: `Image selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select an image file" };
  }, []);

  const {
    file,
    loading,
    setLoading,
    isDragging,
    statusMessage,
    setStatusMessage,
    previewUrl,
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
    if (!file) return;

    setLoading(true);
    setExtractedText("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text);
        setStatusMessage("Text extracted successfully!");
      } else {
        const err = await response.json();
        setStatusMessage(`Error: ${err.error || "Failed to extract text"}`);
      }
    } catch (err) {
      setStatusMessage("Failed to extract text. Make sure Tesseract is installed and backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-6 md:p-10 flex flex-col items-center bg-gradient-to-br from-[#f8fafc] to-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
      {/* Title section */}
      <h1 className="mb-2 text-[#0f172a] text-4xl md:text-5xl font-black tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1.5 after:bg-gradient-to-r after:from-indigo-600 after:to-blue-500 after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:rounded-full">
        Text Extraction (OCR)
      </h1>
      <p className="mt-6 mb-8 text-[0.95rem] md:text-base text-slate-500 font-medium text-center max-w-[600px]">
        Upload any image (PNG, JPG, etc.) and extract editable text using Tesseract optical character recognition engine.
      </p>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file}
          previewUrl={previewUrl}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={() => { handleClear(); setExtractedText(""); }}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept="image/*"
          defaultIcon={<FileText className="w-12 h-12 text-indigo-600" />}
          defaultText="Choose image file or drag & drop here"
          supportText="Supports PNG, JPG, JPEG, GIF, BMP, and more"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-4 px-10 border-none rounded-xl cursor-pointer text-lg font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:enabled:shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:enabled:-translate-y-0.5 active:enabled:translate-y-0 disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none w-full max-w-[300px] mx-auto flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Extract Text
            </>
          )}
        </button>

        {statusMessage && (
          <p className="mt-6 text-[0.95rem] font-semibold text-indigo-600 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100/30 animate-in fade-in duration-300">
            {statusMessage}
          </p>
        )}

        {extractedText && (
          <div className="mt-8 w-full text-left bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" /> Extracted Text
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center gap-1.5 p-1 px-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 bg-white shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600 font-bold" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-56 p-4 bg-slate-50/30 border border-slate-200 rounded-xl font-mono text-sm leading-relaxed text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>
        )}
      </form>
    </div>
  );
}

export default ImageOcr;
