import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Expand, Image as ImageIcon } from "lucide-react";
import { toastSuccess, toastError, toastLoading, toastDismiss, parseApiError } from "../utils/toast";

function ImageResize() {
  const [dimensions, setDimensions] = useState({ width: "1280", height: "720" });
  const [unit, setUnit] = useState("px");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);

  const validateFile = useCallback(async (selectedFile: any) => {
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

  const presets = [
    { name: "Small", width: 640, height: 480 },
    { name: "Medium", width: 1280, height: 720 },
    { name: "Large", width: 1920, height: 1080 },
    { name: "Square", width: 1080, height: 1080 },
  ];

  const handleDimensionChange = (field, value) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (width, height) => {
    setUnit("px");
    setDimensions({ width: String(width), height: String(height) });
  };

  const modifyFormData = (formData) => {
    formData.append("width", dimensions.width);
    formData.append("height", dimensions.height);
    formData.append("unit", unit);
    formData.append("maintainAspectRatio", String(maintainAspectRatio));
  };

 
const getValidationError = (dimensions, maintainAspectRatio, unit) => {
  const width = Number(dimensions.width);
  const height = Number(dimensions.height);

 
  if (!String(dimensions.width).trim()) return `Please enter a width in ${unit}.`;
  if (width <= 0) return `Width must be greater than 0 ${unit}.`;


  if (!maintainAspectRatio) {
    if (!String(dimensions.height).trim()) return `Please enter a height in ${unit}.`;
    if (height <= 0) return `Height must be greater than 0 ${unit}.`;
  }

  return null; 
};


const handleBeforeSubmit = () => {
  const errorMessage = getValidationError(dimensions, maintainAspectRatio, unit);
  if (errorMessage) {
    toastError(errorMessage);
    return false;
  }
  return true;
};

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <ImageIcon className="w-4 h-4 text-blue-500" />
          Resize Presets
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {presets.map((preset) => {
            const isActive =
              dimensions.width === String(preset.width) &&
              dimensions.height === String(preset.height) &&
              unit === "px";

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.width, preset.height)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isActive
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-gray-50 border-gray-100 text-gray-800 hover:border-gray-300"
                }`}
              >
                <span>{preset.name}</span>
                <span>{preset.width} x {preset.height}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Resize Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="px">Pixels (px)</option>
            <option value="mm">Millimeters (mm)</option>
            <option value="cm">Centimeters (cm)</option>
          </select>
        </div>

        <label className="flex items-center gap-3 mb-6 rounded-lg border border-gray-200 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={maintainAspectRatio}
            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="block text-sm font-semibold text-gray-700">
              Keep aspect ratio
            </span>
            <span className="block text-xs text-gray-800">
              Height will be auto-calculated from the width in {unit}.
            </span>
          </div>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-left">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Width ({unit})
            </span>
            <input
              type="number"
              min="1"
              step={unit === "px" ? "1" : "0.1"}
              value={dimensions.width}
              onChange={(e) => handleDimensionChange("width", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="text-left">
            <span className="block text-sm font-semibold text-gray-700 mb-2">
              Height ({unit})
            </span>
            <input
              type="number"
              min="1"
              step={unit === "px" ? "1" : "0.1"}
              value={dimensions.height}
              onChange={(e) => handleDimensionChange("height", e.target.value)}
              disabled={maintainAspectRatio}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
            />
            {maintainAspectRatio && (
              <span className="block mt-2 text-xs text-gray-500">
                Height will be calculated automatically from the original image ratio.
              </span>
            )}
          </label>
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image Resize"
      description="Resize images to custom dimensions"
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/resizeImage"
      fileFieldName="image"
      modifyFormData={modifyFormData}
      onSubmit={async (context) => {
        const { file, formData, setLoading } = context;
        if (!handleBeforeSubmit()) {
          setLoading(false);
          return;
        }

        const loadingId = toastLoading(`Resizing "${file.name}"…`);

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/resizeImage`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            const extension = file.name.includes(".")
              ? file.name.slice(file.name.lastIndexOf("."))
              : ".png";
            const baseName = file.name.includes(".")
              ? file.name.replace(/\.[^.]+$/, "")
              : file.name;

            a.href = url;
            a.download = `${baseName}_resized${extension}`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toastDismiss(loadingId);
            toastSuccess(
              maintainAspectRatio
                ? `Image resized using width ${dimensions.width} ${unit} with aspect ratio preserved!`
                : `Image resized to ${dimensions.width} × ${dimensions.height} ${unit}!`,
            );
          } else {
            const errorMsg = await parseApiError(null, response);
            toastDismiss(loadingId);
            toastError(`Resize failed: ${errorMsg}`);
          }
        } catch (error) {
          toastDismiss(loadingId);
          toastError(await parseApiError(error));
        } finally {
          setLoading(false);
        }
      }}
      submitButtonText={`Resize Image (${unit})`}
      loadingButtonText="Resizing..."
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<Expand className="w-16 h-16" />}
      defaultText="Upload image for resizing"
      supportText="Choose a preset or enter custom dimensions and unit"
      inputId="resize-input"
    />
  );
}

export default ImageResize;
