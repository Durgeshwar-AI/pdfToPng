import React, { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastSuccess, toastError } from "../utils/toast";

const INPUT_MODES = [
  { id: "file", label: "Upload .md file" },
  { id: "text", label: "Paste Markdown" },
];

const MdToHtml = () => {
  const [inputMode, setInputMode] = useState("file");
  const [markdownText, setMarkdownText] = useState("");
  const [outputFilename, setOutputFilename] = useState("");
  const [theme, setTheme] = useState("light");

  const isTextMode = inputMode === "text";

  const validateFile = useCallback(async (selectedFile) => {
    if (selectedFile && selectedFile.name.toLowerCase().endsWith(".md")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select a Markdown (.md) file",
    };
  }, []);

  const handleClear = () => {
    setOutputFilename("");
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

  const handleCustomSubmit = async ({ file, setLoading, addToHistory }) => {
    try {
      const form = new FormData();
      if (isTextMode) {
        form.append("text", markdownText);
      } else {
        form.append("file", file);
      }
      if (outputFilename.trim() !== "") {
        form.append("output_filename", outputFilename.trim());
      }
      form.append("theme", theme);

      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/convertMdToHtml`, {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        let downloadName = outputFilename.trim();
        if (!downloadName) {
          downloadName = isTextMode
            ? "document.html"
            : file.name.replace(/\.md$/i, ".html");
        }
        if (!downloadName.toLowerCase().endsWith(".html")) {
          downloadName += ".html";
        }

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        toastSuccess("HTML file has been downloaded!");

        // Add to history
        if (addToHistory) {
          const historyUrl = window.URL.createObjectURL(blob);
          addToHistory(historyUrl, downloadName);
        }
      } else {
        const msg = response ? await response.text() : "Server conversion unavailable";
        toastError(msg || "Conversion failed. Please try again.");
      }
    } catch (error) {
      console.error("Conversion error:", error);
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
    return (
      <div className="w-full space-y-6 mb-8 text-left bg-white/50 p-6 rounded-xl border border-[#c7d2fe] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        {isTextMode && (
          <div className="space-y-3">
            <label
              htmlFor="md-text-input"
              className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider"
            >
              Markdown Text
            </label>
            <textarea
              id="md-text-input"
              rows={12}
              placeholder={"# Hello World\n\nPaste or type your **Markdown** here."}
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              className="w-full p-3 border border-[#e2e8f0] rounded-xl font-mono text-sm resize-y focus:outline-none focus:ring-4 focus:ring-[#4361ee]/10 focus:border-[#4361ee] transition-all bg-white text-[#1a1a2e]"
            />
            <p className="mt-2 text-[11px] text-[#6b7280]">
              Nothing is stored on the server — the text is converted in memory and
              returned as a downloadable HTML file
            </p>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
            Output Filename (optional)
          </label>
          <input
            type="text"
            placeholder={
              isTextMode
                ? "Leave empty to use document.html"
                : "Leave empty to use input name with .html extension"
            }
            value={outputFilename}
            onChange={(e) => setOutputFilename(e.target.value)}
            className="w-full p-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4361ee]/10 focus:border-[#4361ee] transition-all bg-white text-[#1a1a2e] font-medium"
          />
          <p className="mt-2 text-[11px] text-[#6b7280]">
            {isTextMode
              ? "If left blank, the output file will be named document.html"
              : "If left blank, the output file will have the same name as the input file with .html extension"}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
            Theme
          </label>
          <div className="flex space-x-4">
            {["light", "dark", "blue"].map((t) => (
              <label key={t} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value={t}
                  checked={theme === t}
                  onChange={(e) => setTheme(e.target.value)}
                  className="h-4 w-4 text-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/20"
                />
                <span className="text-sm font-medium text-[#1a1a2e] capitalize">{t}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[#6b7280]">
            Choose the CSS theme for the generated HTML
          </p>
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Markdown to HTML Converter"
      description="Convert a Markdown file — or Markdown text you paste in — to HTML with optional themes (light, dark, blue)"
      accept=".md"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Convert to HTML"
      loadingButtonText="Converting..."
      headerFields={headerFields}
      extraFields={extraFields}
      hideFileUpload={isTextMode}
      requireFile={!isTextMode}
      disableSubmit={isTextMode && markdownText.trim() === ""}
      maxWidthClass="max-w-[600px]"
      inputId="file-input"
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v16a2 2 0 002-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2v4h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M2 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      defaultText="Choose Markdown file or drag & drop here"
      supportText="Click to browse or drop your .md file"
    />
  );
};

export default MdToHtml;