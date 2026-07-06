import React, { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";

const ImageGrayScale = () => {
  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return { isValid: true, message: `Image selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select an image file" };
  }, []);

  return (
    <ToolPageTemplate
      title="Image to Grayscale"
      description="Upload an image and convert it to grayscale."
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/convertGrayscale"
      fileFieldName="image"
      getDownloadFilename={(fileName) => {
        const originalName = fileName.replace(/\.[^/.]+$/, "");
        return `${originalName}_grayscale.png`;
      }}
      submitButtonText="Convert to Grayscale"
      loadingButtonText="Converting..."
      onSuccessMessage="Image converted successfully!"
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, and more"
      inputId="grayscale-input"
    />
  );
};

export default ImageGrayScale;
