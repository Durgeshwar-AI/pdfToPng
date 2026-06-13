import { useState, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { FileText, Type, Copy, Download, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PdfToText() {
  const [extractedText, setExtractedText] = useState("");
  const [hasSelectableText, setHasSelectableText] = useState(true);
  const [copied, setCopied] = useState(false);

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
    statusMessage,
    setStatusMessage,
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
      setExtractedText("");
      setHasSelectableText(true);
      setCopied(false);
      return;
    }

    let cancelled = false;
    const extractText = async () => {
      setLoading(true);
      setStatusMessage("Parsing document and extracting text...");
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = "";
        let hasAnyText = false;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Join text items on the page
          const pageText = textContent.items.map((item) => item.str).join(" ");
          
          if (pageText.trim()) {
            hasAnyText = true;
          }
          
          fullText += `--- Page ${i} ---\n${pageText.trim() || "[No readable text on this page]"}\n\n`;
        }

        if (!cancelled) {
          setExtractedText(fullText.trim());
          setHasSelectableText(hasAnyText);
          if (hasAnyText) {
            setStatusMessage("Text extracted successfully.");
          } else {
            setStatusMessage("Extraction finished. Note: No selectable text was found.");
          }
        }
      } catch (err) {
        console.error("Error extracting text: ", err);
        if (!cancelled) {
          setStatusMessage(`Error: ${err.message || "Failed to extract text from PDF"}`);
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
  }, [file, setLoading, setStatusMessage]);

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    const prevMsg = statusMessage;
    setStatusMessage("Text copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      setStatusMessage(prevMsg);
    }, 2500);
  };

  const handleDownloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file.name.replace(/\.pdf$/i, "");
    a.download = `${baseName}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = (e) => {
    handleClear(e);
    setExtractedText("");
    setHasSelectableText(true);
    setCopied(false);
    setStatusMessage("");
  };

  return (
    <div className="w-full max-w-[750px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        PDF to Text
      </h1>

      <p className="text-gray-500 text-sm mb-8 -mt-6">
        Extract raw text content from digital/selectable PDF documents client-side.
      </p>

      <form className="w-full flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
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
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a PDF to extract text"
          supportText="Reads text streams instantly inside the browser"
        />

        {file && !loading && extractedText && (
          <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4 text-[#4361ee]" />
                Extracted Text Preview
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 font-semibold flex items-center gap-1 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .txt
                </button>
              </div>
            </div>

            {/* Scrollable Text Box */}
            <div className="w-full max-h-[300px] overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm text-[#1a1a2e] whitespace-pre-wrap select-text">
              {extractedText}
            </div>

            {/* Fallback warning if no text was parsed */}
            {!hasSelectableText && (
              <div className="mt-4 flex gap-2.5 items-start bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">No selectable text found:</span> This document appears to be scanned or contains only images of text. If so, please use the <strong className="underline">Image OCR</strong> tool to perform character recognition.
                </div>
              </div>
            )}
          </div>
        )}

        {statusMessage && (
          <p
            className={`mt-4 text-[0.95rem] flex items-center justify-center gap-2 ${
              statusMessage.toLowerCase().includes("error")
                ? "text-red-500"
                : statusMessage.toLowerCase().includes("success") || statusMessage.toLowerCase().includes("copied")
                ? "text-green-600"
                : "text-[#4b5563]"
            }`}
          >
            {(statusMessage.toLowerCase().includes("success") || statusMessage.toLowerCase().includes("copied")) && (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            {loading && <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#4361ee]" />}
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}

export default PdfToText;
