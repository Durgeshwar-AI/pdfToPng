import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText, Zap, Maximize, ShieldCheck } from "lucide-react";
import { formatFileSize, calculateSavedPercentage } from "../utils/fileSizeFormatter";

function PdfCompress() {
  const [level, setLevel] = useState("medium");
  const [originalSize, setOriginalSize] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);

  const presets = [
    { name: "Low", value: "low", icon: <Maximize className="w-4 h-4" />, desc: "Faster, mild reduction" },
    { name: "Medium", value: "medium", icon: <Zap className="w-4 h-4" />, desc: "Balanced compression" },
    { name: "High", value: "high", icon: <ShieldCheck className="w-4 h-4" />, desc: "Maximum reduction" },
  ];

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setOriginalSize(selectedFile.size);
      setConvertedSize(null);
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: "Error: Please select a PDF file" };
  }, []);

  const modifyFormData = (formData) => {
    formData.append("level", level);
  };

  const onSuccess = (responseBlob) => {
    setConvertedSize(responseBlob.size);
    return `Success! PDF compressed at ${level} level.`;
  };

  const extraFields = ({ file }) => {
    if (!file) return null;

    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-blue-500" />
          Compression Level
        </label>

        <div className="grid grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setLevel(p.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                level === p.value
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
              }`}
            >
              {p.icon}
              {p.name}
              <span className="text-[10px] font-normal text-center">{p.desc}</span>
            </button>
          ))}
        </div>

        {convertedSize && originalSize && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 File Size Comparison</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Original:</span>
                <span className="font-medium text-gray-700">{formatFileSize(originalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Compressed:</span>
                <span className="font-medium text-green-600">{formatFileSize(convertedSize)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Saved:</span>
                <span className={`font-bold ${calculateSavedPercentage(originalSize, convertedSize) > 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatFileSize(originalSize - convertedSize)} ({calculateSavedPercentage(originalSize, convertedSize).toFixed(1)}%
                  {calculateSavedPercentage(originalSize, convertedSize) > 0 ? "↓" : "↑"})
                </span>
              </div>
            </div>
          </div>
        )}

        {!convertedSize && originalSize && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Click "Compress PDF" to see file size comparison.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF Compressor"
      accept=".pdf,application/pdf"
      validateFile={validateFile}
      apiEndpoint="/compress-pdf"
      fileFieldName="file"
      modifyFormData={modifyFormData}
      getDownloadFilename={(fileName) => fileName.replace(/\.pdf$/i, "_compressed.pdf")}
      submitButtonText="Compress PDF"
      loadingButtonText="Compressing..."
      onSuccess={onSuccess}
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Upload a PDF to compress"
      supportText="Reduce PDF file size with no extra dependencies"
      inputId="pdf-compress-input"
    />
  );
}

export default PdfCompress;