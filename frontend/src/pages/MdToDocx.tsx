import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText } from "lucide-react";
import { toastSuccess, toastError } from "../utils/toast";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INPUT_MODES = [
  { id: "file", label: "Upload .md file" },
  { id: "text", label: "Paste Markdown" },
];

function MdToDocx() {
  const [inputMode, setInputMode] = useState("file");
  const [markdownText, setMarkdownText] = useState("");

  const isTextMode = inputMode === "text";

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.name.toLowerCase().endsWith(".md")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: "Error: Please select a Markdown (.md) file" };
  }, []);

  const handleClear = () => {
    setMarkdownText("");
  };

  // Only one input source may be active at a time, so switching modes drops
  // whatever was entered in the mode being left behind.
  const switchInputMode = (mode, clearFile) => {
    if (mode === inputMode) return;
    setInputMode(mode);
    if (mode === "text") {
      clearFile();
    } else {
      setMarkdownText("");
    }
  };

  const handleSubmit = async ({ file, setLoading }) => {
    try {
      const formData = new FormData();
      if (isTextMode) {
        formData.append("text", markdownText);
      } else {
        formData.append("file", file);
      }

      const response = await fetch(`${BACKEND_URL}/convertMdToDocx`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = isTextMode
          ? "document.docx"
          : file.name.replace(/\.md$/i, ".docx");
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

  const headerFields = ({ handleClear: clearFile }) => {
    return (
      <div className="w-full mb-8 flex flex-wrap gap-2 p-1.5 bg-white/50 rounded-xl border border-[#c7d2fe] shadow-sm">
        {INPUT_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            aria-pressed={inputMode === mode.id}
            onClick={() => switchInputMode(mode.id, clearFile)}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              inputMode === mode.id
                ? "bg-[#4361ee] text-white shadow-sm"
                : "text-[#1a1a2e] hover:bg-[#eef2ff]"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    );
  };

  const extraFields = () => {
    if (!isTextMode) return null;

    return (
      <div className="w-full space-y-3 mb-8 text-left bg-white/50 p-6 rounded-xl border border-[#c7d2fe] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        <label
          htmlFor="md-to-docx-text-input"
          className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider"
        >
          Markdown Text
        </label>
        <textarea
          id="md-to-docx-text-input"
          rows={12}
          placeholder={"# Hello World\n\nPaste or type your **Markdown** here."}
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          className="w-full p-3 border border-[#e2e8f0] rounded-xl font-mono text-sm resize-y focus:outline-none focus:ring-4 focus:ring-[#4361ee]/10 focus:border-[#4361ee] transition-all bg-white text-[#1a1a2e]"
        />
        <p className="mt-2 text-[11px] text-[#6b7280]">
          Nothing is stored on the server — the text is converted in memory and
          downloaded as document.docx
        </p>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Markdown to DOCX"
      description="Convert a Markdown file — or Markdown text you paste in — to a Word (.docx) document with proper formatting for headings, lists, code blocks, and links."
      accept=".md"
      validateFile={validateFile}
      onSubmit={handleSubmit}
      onClear={handleClear}
      submitButtonText="Convert to DOCX"
      loadingButtonText="Converting..."
      headerFields={headerFields}
      extraFields={extraFields}
      hideFileUpload={isTextMode}
      requireFile={!isTextMode}
      disableSubmit={isTextMode && markdownText.trim() === ""}
      maxWidthClass="max-w-[600px]"
      defaultIcon={<FileText className="w-16 h-16" />}
      defaultText="Upload a Markdown file"
      supportText="Converts .md to .docx with formatting preserved"
      inputId="md-to-docx-input"
    />
  );
}

export default MdToDocx;
