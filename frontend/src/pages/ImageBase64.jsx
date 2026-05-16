import React, { useCallback, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { Copy, Download, Check, Code } from "lucide-react";

function ImageBase64() {
  const [base64String, setBase64String] = useState("");
  const [copied, setCopied] = useState(false);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)",
    };
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
    if (!file) {
      setStatusMessage("Please select a file first");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    setBase64String("");
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64String(reader.result);
        setLoading(false);
        setStatusMessage("Success! Your image has been converted to Base64.");
      };
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to convert file"}`);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!base64String) return;
    const element = document.createElement("a");
    const fileBlob = new Blob([base64String], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.name.split(".")[0]}_base64.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const onClearAll = () => {
    handleClear();
    setBase64String("");
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image to Base64
      </h1>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file}
          previewUrl={previewUrl}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={onClearAll}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept="image/*"
          inputId="image-input"
          defaultIcon={<Code size={64} />}
          defaultText="Choose image file or drag & drop here"
          supportText="Supports PNG, JPG, JPEG, GIF, BMP, and more"
        />
        
        {!base64String && (
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
                Converting...
              </>
            ) : (
              "Convert to Base64"
            )}
          </button>
        )}

        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>

      {base64String && (
        <div className="w-full mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#1a1a2e]">Base64 Data URI</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadAsTxt}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download size={16} />
                Download .txt
              </button>
            </div>
          </div>
          <div className="relative group">
            <textarea
              readOnly
              value={base64String}
              className="w-full h-48 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl font-mono text-xs text-[#334155] resize-none focus:outline-none focus:ring-2 focus:ring-[#4361ee]/20 break-all"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f8fafc]/50 pointer-events-none rounded-xl"></div>
          </div>
          <p className="mt-2 text-xs text-[#64748b] text-left italic">
            * This string can be used directly in <code>&lt;img src="..." /&gt;</code> or CSS <code>url(...)</code>.
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageBase64;
