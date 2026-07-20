import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import PdfRedactSelector, {
  RedactionRegion,
} from "../components/PdfRedactSelector";
import { toastError } from "../utils/toast";

function PdfRedact() {
  const [regions, setRegions] = useState<RedactionRegion[]>([]);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected.`,
      };
    }
    return {
      isValid: false,
      message: "Please select a valid PDF file.",
    };
  }, []);

  const modifyFormData = (formData: FormData) => {
    formData.append("regions", JSON.stringify(regions));
  };

  const onSubmit = async ({ file, formData, setLoading, addToHistory }) => {
    if (regions.length === 0) {
      toastError(
        "Draw at least one box over the content you want to redact first."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/redactPdf`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toastError(data?.message || "Redaction failed. Please try again.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const downloadName = file.name.replace(/\.pdf$/i, "-redacted.pdf");
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      const historyUrl = window.URL.createObjectURL(blob);
      addToHistory(historyUrl, downloadName);
      setRegions([]);
    } catch {
      toastError("Redaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extraContent = (context: any) => {
    if (!context.file) return null;
    return (
      <PdfRedactSelector
        file={context.file}
        regions={regions}
        onRegionsChange={setRegions}
      />
    );
  };

  return (
    <ToolPageTemplate
      title="Redact PDF"
      description="Permanently remove sensitive text or regions from a PDF before sharing. Redacted content is deleted, not just covered."
      accept="application/pdf"
      validateFile={validateFile}
      fileFieldName="file"
      modifyFormData={modifyFormData}
      onSubmit={onSubmit}
      onClear={() => setRegions([])}
      submitButtonText="Redact & Download"
      loadingButtonText="Redacting..."
      extraContent={extraContent}
      maxWidthClass="max-w-[900px]"
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
          <rect
            x="7.5"
            y="12"
            width="9"
            height="3"
            rx="0.5"
            fill="currentColor"
          />
        </svg>
      }
      defaultText="Upload a PDF to redact"
      supportText="Draw boxes over the content to permanently remove"
      inputId="pdf-redact-input"
    />
  );
}

export default PdfRedact;