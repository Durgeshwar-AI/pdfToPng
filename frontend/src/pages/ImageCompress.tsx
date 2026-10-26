import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Sliders, Zap, ShieldCheck, Maximize, FileImage } from "lucide-react";
import {
  formatFileSize,
  calculateSavedPercentage,
} from "../utils/fileSizeFormatter";
import { downloadImage, getImageDimensions, renderImage } from "../utils/browserImage";
import { useHistory } from "../context/history-context";
import { toastSuccess } from "../utils/toast";

// "Original" keeps the uploaded format when the browser supports it.
const OUTPUT_FORMATS = [
  { value: "original", label: "Original", extension: null },
  { value: "jpeg", label: "JPEG", extension: "jpg" },
  { value: "webp", label: "WebP", extension: "webp" },
  { value: "png", label: "PNG", extension: "png" },
] as const;

type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"];

function ImageCompress() {
  const [quality, setQuality] = useState(70);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const [, setUploadedFile] = useState<File | null>(null);
  const { addToHistory } = useHistory();

  // PNG is lossless, so the backend ignores the quality value for it.
  const isLossless = outputFormat === "png";

  const validateFile = useCallback(async (selectedFile: any) => {
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

  const onSubmit = async ({ file, setStatusMessage }) => {
    if (!file) throw new Error("Please select an image file first.");
    setStatusMessage("Compressing image in your browser...");
    const { width, height } = await getImageDimensions(file);
    const mimeType = outputFormat === "original"
      ? (file.type === "image/webp" || file.type === "image/png" ? file.type : "image/jpeg")
      : `image/${outputFormat}`;
    const blob = await renderImage(file, width, height, undefined, mimeType, quality / 100);
    setConvertedSize(blob.size);
    const extension = outputFormat === "original"
      ? (mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg")
      : OUTPUT_FORMATS.find((format) => format.value === outputFormat)?.extension || "jpg";
    const downloadName = file.name.replace(/\.[^.]+$/, `_compressed.${extension}`);
    const historyUrl = downloadImage(blob, downloadName);
    addToHistory({ fileName: file.name, conversionType: "Image Compressor", downloadUrl: historyUrl, downloadName });
    toastSuccess(isLossless ? "Image optimized as PNG." : `Image compressed with ${quality}% quality.`);
  };

  const extraFields = ({ file }: { file: File | null }) => {
    if (!file) return null;

    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <FileImage className="w-4 h-4 text-blue-500" />
            Output Format
          </legend>

          <div className="grid grid-cols-4 gap-2">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={outputFormat === f.value}
                onClick={() => {
                  setOutputFormat(f.value);
                  // The previous result was produced in another format, so its
                  // size comparison no longer applies.
                  setConvertedSize(null);
                }}
                className={`p-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                  outputFormat === f.value
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>

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

        {isLossless && (
          <p className="mt-4 text-xs text-gray-500">
            PNG is a lossless format, so the quality setting is ignored — the
            image is re-encoded with optimized compression instead.
          </p>
        )}

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
      description="Reduce image file size while maintaining quality, with an optional output format"
      accept="image/*"
      validateFile={validateFile}
      onSubmit={onSubmit}
      submitButtonText="Compress Image"
      loadingButtonText="Compressing..."
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<Sliders className="w-16 h-16" />}
      defaultText="Upload image for compression"
      supportText="Adjust quality, pick an output format, and reduce file size in your browser"
      inputId="compress-input"
    />
  );
}

export default ImageCompress;
