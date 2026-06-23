import { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText } from "lucide-react";

function PdfPptx() {
  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Please select a valid PDF file.",
    };
  }, []);

  const getDownloadFilename = (fileName) =>
    fileName.replace(/\.pdf$/i, ".pptx");

  return (
    <ToolPageTemplate
      title="PDF to PowerPoint"
      description="Convert PDF documents into editable PowerPoint (.pptx) presentations."
      accept=".pdf"
      validateFile={validateFile}
      apiEndpoint="/convertPptx"
      fileFieldName="file"
      getDownloadFilename={getDownloadFilename}
      submitButtonText="Convert to PowerPoint"
      loadingButtonText="Converting…"
      maxWidthClass="max-w-[700px]"
      inputId="pdf-pptx-input"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Choose PDF file or drag & drop here"
      supportText="Each PDF page becomes a separate slide."
    />
  );
}

export default PdfPptx;
