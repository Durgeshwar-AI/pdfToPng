import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { downloadImage, getImageDimensions, renderImage } from "../utils/browserImage";
import { useHistory } from "../context/history-context";
import { toastSuccess } from "../utils/toast";

function ImageUpscale() {
  const [scaleFactor, setScaleFactor] = useState(2);
  const { addToHistory } = useHistory();

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return { isValid: true, message: `Image selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select an image file" };
  }, []);

  const onSubmit = async ({ file, setStatusMessage }) => {
    if (!file) throw new Error("Please select an image file first.");
    setStatusMessage("Upscaling image in your browser...");
    const { width, height } = await getImageDimensions(file);
    const blob = await renderImage(file, width * scaleFactor, height * scaleFactor);
    const downloadName = `${file.name.replace(/\.[^.]+$/, "")}_${scaleFactor}x.png`;
    const historyUrl = downloadImage(blob, downloadName);
    addToHistory({
      fileName: file.name,
      conversionType: "Image Upscaling",
      downloadUrl: historyUrl,
      downloadName,
    });
    toastSuccess("Image upscaled successfully.");
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full mt-6 text-left mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upscale Factor</label>
        <div className="flex gap-4">
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScaleFactor(s)}
              className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                scaleFactor === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image Upscaling"
      description="Increase image resolution locally in your browser."
      accept="image/*"
      validateFile={validateFile}
      onSubmit={onSubmit}
      submitButtonText="Upscale Image"
      loadingButtonText="Upscaling..."
      extraFields={extraFields}
      maxWidthClass="max-w-[600px]"
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 3v18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 14l4-4 4 4 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, and more; processed in your browser"
      inputId="upscale-input"
    />
  );
}

export default ImageUpscale;
