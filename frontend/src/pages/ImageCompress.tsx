import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Sliders, Zap, ShieldCheck, Maximize } from "lucide-react";
import {
  formatFileSize,
  calculateSavedPercentage,
} from "../utils/fileSizeFormatter";

function ImageCompress() {
  const [quality, setQuality] = useState(70);
  const [originalSize, setOriginalSize] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);
  const [, setUploadedFile] = useState(null);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setOriginalSize(selectedFile.size);
      setConvertedSize(null);
      setUploadedFile(selectedFile);

      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message:
        "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)",
    };
  }, []);

  const presets = [
    { name: "Max Compression", quality: 20, icon: <Zap className="w-4 h-4" /> },
    {
      name: "Web Optimized",
      quality: 60,
      icon: <Maximize className="w-4 h-4" />,
    },
    {
      name: "High Quality",
      quality: 90,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const modifyFormData = (formData) => {
    formData.append("quality", quality);
  };

  const onSuccess = (responseBlob) => {
    setConvertedSize(responseBlob.size);
    return `Success! Image compressed with ${quality}% quality.`;
  };

  const extraFields = ({ file }) => {
    if (!file) return null;

    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-500" />
            Compression Quality: {quality}%
          </label>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              quality < 30
                ? "bg-red-100 text-red-600"
                : quality < 70
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
            }`}
          >
            {quality < 30 ? "Low" : quality < 70 ? "Medium" : "High"}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-6"
        />

        <div className="grid grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setQuality(p.quality)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                quality === p.quality
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
              }`}
            >
              {p.icon}
              {p.name}
            </button>
          ))}
        </div>

        {/* File Size Comparison Display */}
        {convertedSize && originalSize && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              📊 File Size Comparison
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Original:</span>
                <span className="font-medium text-gray-700">
                  {formatFileSize(originalSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Compressed:</span>
                <span className="font-medium text-green-600">
                  {formatFileSize(convertedSize)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Saved:</span>
                <span
                  className={`font-bold ${
                    calculateSavedPercentage(originalSize, convertedSize) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatFileSize(originalSize - convertedSize)}(
                  {calculateSavedPercentage(
                    originalSize,
                    convertedSize,
                  ).toFixed(1)}
                  %
                  {calculateSavedPercentage(originalSize, convertedSize) > 0
                    ? "↓"
                    : "↑"}
                  )
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Show message if converted but no display */}
        {!convertedSize && originalSize && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Click "Compress Image" to see file size comparison.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image Compressor"
      description="Reduce image file size while maintaining quality"
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/compress"
      fileFieldName="image"
      modifyFormData={modifyFormData}
      onSubmit={/* your handler if needed */}
      onClear={handleClear}
      onSuccess={onSuccess}
      getDownloadFilename={(fileName) => {
        let extension = fileName.split(".").pop().toLowerCase();
        if (!["jpg", "jpeg", "webp", "png"].includes(extension)) {
          extension = "jpg";
        }
        return fileName.replace(/\.[^.]+$/, `_compressed.${extension}`);
      }}
      submitButtonText="Compress Image"
      loadingButtonText="Compressing..."
      onSuccess={onSuccess}
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<Sliders className="w-16 h-16" />}
      defaultText="Upload image for compression"
      supportText="Adjust quality and reduce file size"
      inputId="compress-input"
    />
  );
}

export default ImageCompress;
