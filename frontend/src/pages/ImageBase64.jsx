import React, { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
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

  const handleCustomSubmit = async ({ file, setStatusMessage, setLoading, setStatusType }) => {
    setBase64String("");
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64String(reader.result);
        setLoading(false);
        setStatusMessage("Success! Your image has been converted to Base64.");
        setStatusType("success");
      };
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to convert file"}`);
      setStatusType("error");
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = (file) => {
    if (!base64String || !file) return;
    const element = document.createElement("a");
    const fileBlob = new Blob([base64String], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.name.split(".")[0]}_base64.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearAll = () => {
    setBase64String("");
  };

  const extraContent = ({ file }) => {
    if (!base64String) return null;
    return (
      <div className="w-full mt-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Base64 Data URI</h3>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => downloadAsTxt(file)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
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
    );
  };

  return (
    <ToolPageTemplate
      title="Image to Base64"
      accept="image/*"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClearAll}
      submitButtonText="Convert to Base64"
      loadingButtonText="Converting..."
      extraContent={extraContent}
      showSubmitButton={!base64String}
      maxWidthClass="max-w-[800px]"
      defaultIcon={<Code size={64} />}
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, GIF, BMP, and more"
      inputId="image-input"
    />
  );
}

export default ImageBase64;
