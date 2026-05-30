import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
function PdfSign() {
  const [signature, setSignature] = useState("");

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected.`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select a PDF file.",
    };
  }, []);

  const modifyFormData = (formData) => {
    formData.append("signature", signature);
  };

  const extraFields = () => {
    return (
      <div className="w-full mt-6 text-left mb-6">
        <label className="block text-sm font-medium text-[#111827] mb-2">Signature Text</label>
        <input
          type="text"
          placeholder="Enter signature text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          className="w-full border border-[#d1d5db] p-3 rounded-xl focus:ring-2 focus:ring-[#4361ee] focus:border-[#4361ee] transition-all bg-[#f9fafb] text-[#111827]"
        />
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF Sign Tool"
      description="Easily add a text-based signature to your PDF documents."
      accept="application/pdf"
      validateFile={validateFile}
      apiEndpoint="/sign/signPdf"
      fileFieldName="file"
      modifyFormData={modifyFormData}
      toolName="signed"
      outputExtension="pdf"
      submitButtonText="Sign PDF"
      loadingButtonText="Signing..."
      onSuccessMessage="Success! Your signed PDF is downloaded."
      extraFields={extraFields}
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
            d="M16 13H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 17H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 9H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose PDF file or drag & drop here"
      supportText="Upload the PDF you want to sign"
      inputId="pdf-sign-input"
    />
  );
}

export default PdfSign;