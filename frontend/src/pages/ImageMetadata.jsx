import React, { useState, useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Info, Copy, Check, Download } from "lucide-react";

export default function ImageMetadata() {
  const [metadata, setMetadata] = useState(null);
  const [securityReport, setSecurityReport] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  
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
      message: "Error: Please select an image file (PNG, JPG, JPEG, WEBP, etc.)",
    };
  }, []);

  const handleClear = () => {
    setMetadata(null);
    setSecurityReport(null);
    setCopiedKey(null);
  };

  const handleViewMetadata = async ({ formData, setStatusMessage, setLoading, setStatusType }) => {
    setMetadata(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/view-metadata`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setStatusMessage(`Error: ${data.error || "Failed to read metadata"}`);
        setStatusType("error");
        return;
      }
      if (data.message) {
        setStatusMessage(data.message);
        setStatusType("info");
        return;
      }
      setMetadata(data.metadata);
      setSecurityReport(data.security_report);
      setStatusMessage("Success! Metadata loaded.");
      setStatusType("success");
    } catch (err) {
      setStatusMessage(`Error: ${err.message || "Failed to read metadata"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  const handleStripMetadata = async (file, setLoading, setStatusMessage, setStatusType) => {
    if (!file) return;
    setLoading(true);
    setStatusMessage("");
    
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/strip-metadata`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to strip metadata");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const extension = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : ".png";
      const baseName = file.name.includes(".")
        ? file.name.replace(/\.[^.]+$/, "")
        : file.name;
      a.download = `${baseName}_stripped${extension}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("Success! Metadata stripped and image downloaded.");
      setStatusType("success");
    } catch (err) {
      setStatusMessage(`Error: ${err.message || "Failed to strip metadata"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };
  const handleCleanAndDownload = async (file, setLoading, setStatusMessage, setStatusType) => {
  if (!file) return;

  setLoading(true);
  setStatusMessage("Cleaning metadata...");

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/strip-metadata`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to clean image");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";

    a.download = `${baseName}_privacy_cleaned.${extension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    setStatusMessage("Privacy cleaned successfully!");
    setStatusType("success");

    // optional UX reset
    setMetadata(null);
    setSecurityReport(null);
  } catch (err) {
    setStatusMessage(`Error: ${err.message}`);
    setStatusType("error");
  } finally {
    setLoading(false);
    setTimeout(() => setStatusMessage(""), 4000);
  }
};
  const copyToClipboard = (key, value) => {
    navigator.clipboard.writeText(`${key}: ${value}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const extraContent = ({ file, loading, setLoading, setStatusMessage, setStatusType }) => {
    if (!metadata) return null;

    const keys = Object.keys(metadata);

    return (
      <div className="w-full mt-8 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Image Metadata</h3>
          <button
            onClick={() => handleStripMetadata(file, setLoading, setStatusMessage, setStatusType)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:from-red-600 hover:to-rose-700 transition-all cursor-pointer disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Strip Metadata & Download
          </button>
           <button
    onClick={() =>
      handleCleanAndDownload(file, setLoading, setStatusMessage, setStatusType)
    }
    disabled={loading}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:from-green-600 hover:to-emerald-700 transition-all cursor-pointer disabled:opacity-50"
  >
    <Download size={16} />
    One-Click Clean
  </button>
        </div>
{securityReport && (
  <div className="mb-6 p-4 rounded-xl border bg-yellow-50 border-yellow-200">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-yellow-800">
      <span
  className={`px-3 py-1 rounded-full text-xs font-bold ${
    securityReport.risk_level === "HIGH"
      ? "bg-red-100 text-red-700"
      : securityReport.risk_level === "MEDIUM"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700"
  }`}
>
  Privacy Risk: {securityReport.risk_level}
</span>
      </h3>
      <div className="flex flex-col gap-2">
  <span className="text-sm font-bold text-yellow-700">
    Score: {securityReport.risk_score}/100
  </span>

  {/* Risk Progress Bar */}
  <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
    <div
      className={`h-full transition-all duration-500 ${
        securityReport.risk_level === "HIGH"
          ? "bg-red-500"
          : securityReport.risk_level === "MEDIUM"
          ? "bg-yellow-500"
          : "bg-green-500"
      }`}
      style={{ width: `${securityReport.risk_score}%` }}
    />
  </div>
</div>
    </div>

    <div className="mt-3 text-sm text-yellow-900">
      <p className="font-medium mb-2">Sensitive Data Detected:</p>
      <ul className="list-disc ml-5 space-y-1">
        {securityReport.sensitive_fields?.map((item, idx) => (
          <li key={idx}>
            <span className="font-semibold">{item.field}</span> — {item.description}
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-3 text-sm text-yellow-900">
      <p className="font-medium mb-2">Recommended Actions:</p>
      <ul className="list-disc ml-5 space-y-1">
        {securityReport.recommended_actions?.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  </div>
)}
        {keys.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center text-sm text-gray-800">
            No metadata found in this image.
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto max-h-[350px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider w-1/3">
                      Tag / Field
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider w-16 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {keys.map((key) => {
                    const value = typeof metadata[key] === "object"
                      ? JSON.stringify(metadata[key])
                      : String(metadata[key]);

                    return (
                      <tr key={key} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-600 break-all font-semibold">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-600 break-all max-w-xs">
                          {value}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => copyToClipboard(key, value)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-gray-600 transition-colors cursor-pointer"
                            title="Copy tag and value"
                          >
                            {copiedKey === key ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Metadata Viewer"
      accept="image/*"
      validateFile={validateFile}
      onSubmit={handleViewMetadata}
      onClear={handleClear}
      submitButtonText="View Metadata"
      loadingButtonText="Reading Metadata..."
      extraContent={extraContent}
      showSubmitButton={!metadata}
      maxWidthClass="max-w-[800px]"
      inputId="metadata-input"
      defaultIcon={<Info className="w-16 h-16" />}
      defaultText="Choose image file or drag & drop here"
      supportText="Upload image to view, inspect or strip metadata"
    />
  );
}