import { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";

function ImageJpg() {
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

  return (
    <ToolPageTemplate
      title="Image to JPG Converter"
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/convertJpeg"
      fileFieldName="image"
      getDownloadFilename={(fileName) =>
        fileName.replace(/\.(png|jpg|jpeg|gif|bmp|tiff|svg|webp)$/i, ".jpg")
      }
      submitButtonText="Convert to JPG"
      loadingButtonText="Converting..."
      onSuccessMessage="Success! Your JPEG file has been downloaded."
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
