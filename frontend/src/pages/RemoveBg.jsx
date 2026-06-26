import { useCallback } from 'react';
import ToolPageTemplate from '../components/ToolPageTemplate';

function RemoveBg() {
  const validateFile = useCallback(selectedFile => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(
          1
        )} KB)`,
      };
    }
    return {
      isValid: false,
      message: 'Error: Please select an image file (PNG, JPG, JPEG, etc.)',
    };
  }, []);

  return (
    <ToolPageTemplate
      title="Remove Background"
      accept="image/*"
      validateFile={validateFile}
      apiEndpoint="/removeBg"
      fileFieldName="image"
      getDownloadFilename={fileName => {
        const originalName = fileName.split('.')[0];
        return `${originalName}_no_bg.png`;
      }}
      submitButtonText="Remove Background"
      loadingButtonText="Removing..."
      onSuccessMessage="Background removed successfully!"
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 18V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 15L12 12L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Click to browse or drop your image file"
      inputId="file-input"
    />
  );
}

export default RemoveBg;
