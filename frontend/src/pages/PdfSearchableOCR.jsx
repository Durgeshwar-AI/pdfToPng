import { useCallback, useState } from "react";
import { FileSearch, Wand2 } from "lucide-react";
import ToolPageTemplate from "../components/ToolPageTemplate";

function PdfSearchableOCR() {
  const [language, setLanguage] = useState("eng");
  const [preprocess, setPreprocess] = useState("balanced");

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
      message: "Error: Please select a PDF file",
    };
  }, []);

  const modifyFormData = (formData) => {
    formData.append("language", language);
    formData.append("preprocess", preprocess);
  };

  const extraFields = ({ file }) => {
    if (!file) return null;

    return (
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">OCR Settings</h3>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          OCR Language
        </label>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="eng+hin">English + Hindi</option>
        </select>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Preprocessing
        </label>
        <select
          value={preprocess}
          onChange={(event) => setPreprocess(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="none">None</option>
          <option value="light">Light denoise</option>
          <option value="balanced">Balanced OCR cleanup</option>
          <option value="strong">Strong thresholding</option>
        </select>

        <p className="mt-4 text-xs text-slate-500">
          Best for scanned PDFs, invoices, forms, notes, and image-only documents.
        </p>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Scanned PDF OCR"
      description="Convert image-only scanned PDFs into searchable PDFs with selectable text."
      endpoint="/searchable-pdf-ocr"
      accept="application/pdf"
      validateFile={validateFile}
      modifyFormData={modifyFormData}
      getOutputFileName={(fileName) =>
        fileName.replace(/\.pdf$/i, "_searchable.pdf")
      }
      submitButtonText="Create Searchable PDF"
      loadingButtonText="Running OCR..."
      onSuccess={() => "Success! Searchable PDF created."}
      extraFields={extraFields}
      maxWidthClass="max-w-[760px]"
      defaultIcon={<FileSearch />}
      defaultText="Upload a scanned PDF"
      supportText="Creates a searchable PDF using local OCR processing."
      inputId="pdf-searchable-ocr-input"
    />
  );
}

export default PdfSearchableOCR;
