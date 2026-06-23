import { useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText } from "lucide-react";
import { toastSuccess, toastError } from "../utils/toast";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MdToDocx() {
  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.name.toLowerCase().endsWith(".md")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: "Error: Please select a Markdown (.md) file" };
  }, []);

  const handleSubmit = async ({ file, setLoading }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BACKEND_URL}/convertMdToDocx`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.md$/i, ".docx");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastSuccess("DOCX file has been downloaded!");
      } else {
        const msg = await response.text();
        try {
          const parsed = JSON.parse(msg);
          toastError(parsed.message || parsed.error || "Conversion failed");
        } catch {
          toastError(msg || "Conversion failed. Please try again.");
        }
      }
    } catch (error) {
      toastError(error.message || "Failed to convert file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageTemplate
      title="Markdown to DOCX"
      description="Convert Markdown files to Word (.docx) documents with proper formatting for headings, lists, code blocks, and links."
      accept=".md"
      validateFile={validateFile}
      onSubmit={handleSubmit}
      submitButtonText="Convert to DOCX"
      loadingButtonText="Converting..."
      maxWidthClass="max-w-[600px]"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Upload a Markdown file"
      supportText="Converts .md to .docx with formatting preserved"
      inputId="md-to-docx-input"
    />
  );
}

export default MdToDocx;
