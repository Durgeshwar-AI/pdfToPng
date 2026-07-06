import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";

function ImageUpscale() {
  const [scaleFactor, setScaleFactor] = useState(2);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return { isValid: true, message: `Image selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select an image file" };
  }, []);

  const modifyFormData = (formData) => {
    formData.append("scale", scaleFactor);
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
      title="AI Image Upscaler"
      description="Increase image resolution while maintaining quality."
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/upscale"
      fileFieldName="image"
      modifyFormData={modifyFormData}
      getDownloadFilename={(fileName) => {
        const originalName = fileName.split(".")[0];
        return `${originalName}_${scaleFactor}x.png`;
      }}
      submitButtonText="Upscale Image"
      loadingButtonText="Upscaling..."
      onSuccessMessage="Image upscaled successfully!"
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
      supportText="Supports PNG, JPG, JPEG, and more"
      inputId="upscale-input"
    />
  );
}

export default ImageUpscale;
