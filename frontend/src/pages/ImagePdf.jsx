import { PDFDocument } from "pdf-lib";
import { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { triggerDownload } from "../utils/downloadFile";

function ImagePdf() {
  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `Image selected: ${selectedFile.name}`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select an image file.",
    };
  }, []);

  const createPdf = async ({ file, setLoading, setStatusMessage, setStatusType, resolveFilename }) => {
    if (!file) return;

    setLoading(true);
    setStatusMessage("Creating PDF...");
    setStatusType("info");

    try {
      const pdfDoc = await PDFDocument.create();

      const bytes = await file.arrayBuffer();
      let image;
      if (file.type === "image/png") {
        image = await pdfDoc.embedPng(bytes);
      } else {
        image = await pdfDoc.embedJpg(bytes);
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      triggerDownload(blob, resolveFilename("converted-image.pdf"));

      setStatusMessage("Success! Your PDF has been created.");
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatusMessage("Error: Failed to create PDF. See console for details.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageTemplate
      title="Image to PDF"
      description="Convert an image into a PDF file, right in your browser."
      accept="image/*"
      validateFile={validateFile}
      onSubmit={createPdf}
      toolName="pdf"
      outputExtension="pdf"
      submitButtonText="Convert to PDF"
      loadingButtonText="Creating..."
      onSuccessMessage="Success! Your PDF has been created."
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 16L8.58579 11.4142C9.36683 10.6332 10.6332 10.6332 11.4142 11.4142L16 16M14 14L15.5858 12.4142C16.3668 11.6332 17.6332 11.6332 18.4142 12.4142L20 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 8H14.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, GIF, and more"
      inputId="image-pdf-input"
    />
  );
}

export default ImagePdf;