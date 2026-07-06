import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { formatFileSize, calculateSavedPercentage } from "../utils/fileSizeFormatter";

function ImageJpg() {
  const [originalSize, setOriginalSize] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setOriginalSize(selectedFile.size);
      setConvertedSize(null);
      
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

  const onSuccess = (responseBlob) => {
    setConvertedSize(responseBlob.size);
    return "Success! Your JPEG file has been downloaded.";
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    
    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
        {(convertedSize && originalSize) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 File Size Comparison</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Original:</span>
                <span className="font-medium text-gray-700">{formatFileSize(originalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Converted (JPG):</span>
                <span className="font-medium text-green-600">{formatFileSize(convertedSize)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Saved:</span>
                <span className={`font-bold ${
                  calculateSavedPercentage(originalSize, convertedSize) > 0 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  {formatFileSize(originalSize - convertedSize)} 
                  ({calculateSavedPercentage(originalSize, convertedSize).toFixed(1)}% 
                  {calculateSavedPercentage(originalSize, convertedSize) > 0 ? "↓" : "↑"})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image to JPG Converter"
      description="..."
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/convertJpeg"
      fileFieldName="image"
      getDownloadFilename={(fileName) =>
        fileName.replace(/\.(png|jpg|jpeg|gif|bmp|tiff|svg|webp)$/i, ".jpg")
      }
      submitButtonText="Convert to JPG"
      loadingButtonText="Converting..."
      onSuccess={onSuccess}
      extraFields={extraFields}
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="8.5"
            cy="8.5"
            r="1.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, GIF, BMP, and more"
      inputId="image-input"
    />
  );
}

export default ImageJpg;
