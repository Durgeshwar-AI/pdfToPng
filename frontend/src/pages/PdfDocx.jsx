import { useCallback, useState } from "react";

import ToolPageTemplate from "../components/ToolPageTemplate";
import { FileText, Table, Image, ScanLine, Lock } from "lucide-react";
import {
  toastError,
  toastLoading,
  toastDismiss,
  parseApiError,
} from "../utils/toast";

const PdfDocx = () => {
  const [numPages, setNumPages] = useState(0);
  const [pageMode, setPageMode] = useState("all");
  const [pageRange, setPageRange] = useState("");
  const [singlePage, setSinglePage] = useState("1");
  const [extractTables, setExtractTables] = useState(true);
  const [extractImages, setExtractImages] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [password, setPassword] = useState("");

  const validateFile = useCallback(async (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");

        const pdfWorker = await import(
          "pdfjs-dist/build/pdf.worker.min.mjs?url"
        );

        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;

        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
        }).promise;
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF info:", err);
      }
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

  const handleClear = () => {
    setNumPages(0);
    setPageRange("");
    setSinglePage("1");
    setPageMode("all");
    setExtractTables(true);
    setExtractImages(true);
    setPreserveFormatting(true);
    setOcrEnabled(false);
    setOcrLanguage("eng");
    setPassword("");
  };

  const handleCustomSubmit = async ({
    file,
    formData,
    setStatusMessage: setInlineProgress,
    setLoading,
  }) => {
    setInlineProgress("Loading PDF…");

    let loadingToastId = null;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");

      const pdfWorker = await import(
        "pdfjs-dist/build/pdf.worker.min.mjs?url"
      );

      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let pagesToRender = [];
      if (pageMode === "all") {
        pagesToRender = Array.from({ length: totalPages }, (_, i) => i + 1);
      } else if (pageMode === "single") {
        const pageNum = parseInt(singlePage);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
          toastError(
            `Invalid page number: ${singlePage}. Please enter a value between 1 and ${totalPages}.`
          );
          setInlineProgress("");
          setLoading(false);
          return;
        }
        pagesToRender = [pageNum];
      } else if (pageMode === "range") {
        const ranges = pageRange.split(",").map((r) => r.trim());
        ranges.forEach((r) => {
          if (r.includes("-")) {
            const [start, end] = r.split("-").map(Number);
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= totalPages) pagesToRender.push(i);
            }
          } else {
            const num = Number(r);
            if (num >= 1 && num <= totalPages) pagesToRender.push(num);
          }
        });
      }

      pagesToRender = [...new Set(pagesToRender)].sort((a, b) => a - b);

      if (pagesToRender.length === 0) {
        toastError("No valid pages selected. Please check your range.");
        setInlineProgress("");
        setLoading(false);
        return;
      }

      loadingToastId = toastLoading(
        `Converting ${pagesToRender.length} page${
          pagesToRender.length > 1 ? "s" : ""
        } to Word…`
      );

      formData.append("extract_tables", extractTables.toString());
      formData.append("extract_images", extractImages.toString());
      formData.append("preserve_formatting", preserveFormatting.toString());
      formData.append("page_range", pagesToRender.join(","));
      if (ocrEnabled) {
        formData.append("ocr_enabled", "true");
        formData.append("ocr_language", ocrLanguage);
      }
      if (password) {
        formData.append("password", password);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/convertDocx`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, ".docx");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toastDismiss(loadingToastId);
        setInlineProgress("");
      } else {
        const errorMsg = await parseApiError(null, response);
        toastDismiss(loadingToastId);
        toastError(`Conversion failed: ${errorMsg}`);
        setInlineProgress("");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      if (loadingToastId) toastDismiss(loadingToastId);
      const errorMsg = await parseApiError(error);
      toastError(errorMsg);
      setInlineProgress("");
    } finally {
      setLoading(false);
    }
  };

  const extraFields = ({ file, loading }) => {
    if (!file) return null;
    return (
      <div className="theme-card animate-in fade-in slide-in-from-top-4 mb-8 w-full space-y-6 rounded-xl p-6 text-left shadow-sm duration-500">
        {loading && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-medium text-[var(--color-app-text)]">
              <span>Converting…</span>
              <span>{numPages > 0 ? `${numPages} page${numPages > 1 ? "s" : ""}` : ""}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-app-border-strong)]">
              <div className="h-full w-full origin-left animate-[progress_2s_ease-in-out_infinite] rounded-full bg-linear-to-r from-[#4361ee] to-[#7209b7]" />
            </div>
          </div>
        )}
        <style>{`@keyframes progress { 0% { transform: scaleX(0); transform-origin: left; } 50% { transform: scaleX(1); transform-origin: left; } 50.01% { transform: scaleX(1); transform-origin: right; } 100% { transform: scaleX(0); transform-origin: right; } }`}</style>
        <div className="space-y-3">
          <span
            id="conversion-options-label"
            className="block text-sm font-bold tracking-wider text-[var(--color-app-text)] uppercase"
          >
            Conversion Options
          </span>
          <div
            className="grid grid-cols-2 gap-3"
            role="group"
            aria-labelledby="conversion-options-label"
          >
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={extractTables}
                onChange={(e) => setExtractTables(e.target.checked)}
                className="w-4 h-4 accent-[#4361ee] rounded border-[var(--color-app-border)]"
              />
              <Table className="h-4 w-4 shrink-0 text-[var(--color-app-primary)]" />
              Extract Tables
            </label>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={extractImages}
                onChange={(e) => setExtractImages(e.target.checked)}
                className="w-4 h-4 accent-[#4361ee] rounded border-[var(--color-app-border)]"
              />
              <Image className="h-4 w-4 shrink-0 text-[var(--color-app-primary)]" />
              Extract Images
            </label>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={preserveFormatting}
                onChange={(e) => setPreserveFormatting(e.target.checked)}
                className="w-4 h-4 accent-[#4361ee] rounded border-[var(--color-app-border)]"
              />
              Preserve Formatting
            </label>
            <label className="flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={ocrEnabled}
                onChange={(e) => setOcrEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#4361ee] rounded border-[var(--color-app-border)]"
              />
              <ScanLine className="h-4 w-4 shrink-0 text-[var(--color-app-primary)]" />
              OCR (Scanned PDFs)
            </label>
          </div>

          {ocrEnabled && (
            <div className="space-y-3">
              <label
                htmlFor="ocr-language-select"
                className="block text-sm font-bold tracking-wider text-[var(--color-app-text)] uppercase"
              >
                OCR Language
              </label>
              <select
                id="ocr-language-select"
                value={ocrLanguage}
                onChange={(e) => setOcrLanguage(e.target.value)}
                className="theme-field w-full cursor-pointer rounded-lg p-2.5 text-sm font-medium transition-all focus:ring-2 focus:ring-[var(--color-app-focus)] focus:outline-none"
              >
                <option value="eng">English (Default)</option>
                <option value="hin">Hindi</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="chi_sim">Chinese Simplified</option>
                <option value="chi_tra">Chinese Traditional</option>
                <option value="jpn">Japanese</option>
                <option value="kor">Korean</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <span
            id="password-section-label"
            className="flex items-center gap-2 text-sm font-bold tracking-wider text-[var(--color-app-text)] uppercase"
          >
            <Lock className="h-4 w-4" />
            Password Protected PDF
          </span>
          <div
            role="group"
            aria-labelledby="password-section-label"
            className="space-y-2"
          >
            <label className="flex items-center gap-2 font-medium cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={!!password}
                onChange={(e) => {
                  if (!e.target.checked) setPassword("");
                }}
                className="w-4 h-4 accent-[#4361ee] rounded border-[var(--color-app-border)]"
              />
              This PDF requires a password
            </label>
            {!!password && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password"
                aria-label="PDF password"
                className="theme-field w-full rounded-xl p-3 font-medium transition-colors focus:border-[var(--color-app-primary)] focus:ring-4 focus:ring-[var(--color-app-focus)] focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <span
            id="page-selection-label"
            className="block text-sm font-bold tracking-wider text-[var(--color-app-text)] uppercase"
          >
            Page Selection {numPages > 0 && `(Total: ${numPages})`}
          </span>
          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-labelledby="page-selection-label"
          >
            {["all", "single", "range"].map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={pageMode === mode}
                onClick={() => setPageMode(mode)}
                className={`cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-transform duration-200 ${
                  pageMode === mode
                    ? "scale-[1.02] bg-[#4361ee] text-white shadow-[0_4px_10px_rgba(67,97,238,0.3)]"
                    : "theme-card theme-muted hover:border-[var(--color-app-primary)] hover:text-[var(--color-app-primary)]"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {pageMode === "single" && (
            <div className="animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-3">
                <label htmlFor="single-page-input" className="theme-muted text-sm font-medium">
                  Page:
                </label>
                <input
                  id="single-page-input"
                  type="number"
                  min="1"
                  max={numPages}
                  value={singlePage}
                  onChange={(e) => setSinglePage(e.target.value)}
                  className="theme-field w-24 rounded-xl p-3 text-center font-bold transition-colors focus:border-[var(--color-app-primary)] focus:ring-4 focus:ring-[var(--color-app-focus)] focus:outline-none"
                />
                <span className="theme-subtle text-xs">of {numPages}</span>
              </div>
            </div>
          )}

          {pageMode === "range" && (
            <div className="animate-in zoom-in-95 duration-200">
              <label htmlFor="page-range-input" className="sr-only">
                Page range
              </label>
              <input
                id="page-range-input"
                type="text"
                placeholder="e.g. 1-3, 5"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                className="theme-field w-full rounded-xl p-3 font-medium transition-colors focus:border-[var(--color-app-primary)] focus:ring-4 focus:ring-[var(--color-app-focus)] focus:outline-none"
              />
              <p className="theme-muted mt-2 text-[11px]">
                Enter page numbers or ranges (e.g., 1-5, 8, 10-12)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF to Word"
      description="Convert text-based PDF documents into editable Word (.docx) files with table, image, and formatting preservation."
      accept="application/pdf"
      fileFieldName="file"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Convert to Word"
      loadingButtonText="Converting…"
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      inputId="pdf-docx-input"
      defaultIcon={<FileText className="h-16 w-16" />}
      defaultText="Upload a PDF to convert"
      supportText="Converts text-based PDFs to .docx with table, image, and formatting options"
    />
  );
};

export default PdfDocx;