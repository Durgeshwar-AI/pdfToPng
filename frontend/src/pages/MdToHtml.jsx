import React, { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastSuccess, toastError } from "../utils/toast";

const MdToHtml = () => {
  const [outputFilename, setOutputFilename] = useState(""); // optional
  const [theme, setTheme] = useState("light"); // light, dark, blue

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
    setTheme("light");
  };

  const handleCustomSubmit = async ({
    file,
    setLoading,
  }) => {
    try {
      const form = new FormData();
      form.append("file", file);
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
        const a = document.createElement("a");
        a.href = downloadUrl;
        // Determine download name: if output_filename provided, use it; else use input name with .html
        let downloadName = outputFilename.trim();
        if (!downloadName) {
          downloadName = file.name.replace(/\.md$/i, ".html");
        }
        // Ensure .html extension
        if (!downloadName.toLowerCase().endsWith(".html")) {
          downloadName += ".html";
        }
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        toastSuccess("HTML file has been downloaded!");
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

  const extraFields = () => {
    return (
      <div className="w-full space-y-6 mb-8 text-left bg-white/50 p-6 rounded-xl border border-[#c7d2fe] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Output Filename */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
            Output Filename (optional)
          </label>
          <input
            type="text"
            placeholder="Leave empty to use input name with .html extension"
            value={outputFilename}
            onChange={(e) => setOutputFilename(e.target.value)}
            className="w-full p-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4361ee]/10 focus:border-[#4361ee] transition-all bg-white text-[#1a1a2e] font-medium"
          />
          <p className="mt-2 text-[11px] text-[#6b7280]">
            If left blank, the output file will have the same name as the input file with .html extension
          </p>
        </div>

        {/* Theme Selection */}
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
                <span className="text-sm font-medium text-[#1a1a2e] capitalize">
                  {t}
                </span>
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
      description="Convert Markdown files to HTML with optional themes (light, dark, blue)"
      accept=".md"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Convert to HTML"
      loadingButtonText="Converting..."
      extraFields={extraFields}
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
          <path
            d="M2 12h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 18h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 12h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 18h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose Markdown file or drag & drop here"
      supportText="Click to browse or drop your .md file"
    />
  );
};

export default MdToHtml;