import { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PdfSplit() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [totalPages, setTotalPages] = useState(null);
  const inputRef = useRef(null);

  // Load total page count using pdfjs whenever a file is chosen
  useEffect(() => {
    if (!file) {
      setTotalPages(null);
      setStartPage("1");
      setEndPage("1");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (!cancelled) {
          setTotalPages(pdf.numPages);
          setEndPage(String(pdf.numPages));
        }
      } catch {
        if (!cancelled) setTotalPages(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const addFile = useCallback((incoming) => {
    const pdf = Array.from(incoming).find(
      (f) => f.type === "application/pdf"
    );
    if (!pdf) {
      setStatusMessage("Only PDF files are accepted.");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    setStatusMessage("");
    setFile(pdf);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      addFile(e.dataTransfer.files);
    },
    [addFile]
  );

  const clearFile = (e) => {
    if (e) e.stopPropagation();
    setFile(null);
    setTotalPages(null);
    setStartPage("1");
    setEndPage("1");
    setStatusMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Clamp helper so live inputs always stay in valid bounds
  const clamp = (val, min, max) =>
    Math.min(Math.max(Number(val), min), max);

  const validatePages = () => {
    const sp = parseInt(startPage, 10);
    const ep = parseInt(endPage, 10);

    if (isNaN(sp) || isNaN(ep)) return "Please enter valid page numbers.";
    if (sp < 1) return "Start page must be at least 1.";
    if (totalPages && ep > totalPages)
      return `End page cannot exceed ${totalPages} (total pages).`;
    if (sp > ep) return "Start page cannot be greater than end page.";
    return null;
  };

  const handleSplit = async () => {
    if (!file) {
      setStatusMessage("Please select a PDF file first.");
      setStatusType("error");
      return;
    }

    const validationError = validatePages();
    if (validationError) {
      setStatusMessage(validationError);
      setStatusType("error");
      return;
    }

    setStatusMessage("");
    setIsLoading(true);
    setStatusType("info");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("start_page", startPage);
      formData.append("end_page", endPage);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/split-pdf`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Split failed. Please try again.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      a.download = `${baseName}_pages_${startPage}-${endPage}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage(
        `Success! Pages ${startPage}–${endPage} extracted and downloaded.`
      );
      setStatusType("success");
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white dark:from-[#0f172a] dark:to-[#111827] dark:border dark:border-slate-700 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">

      {/* Title — matches ToolPageTemplate exactly */}
      <h1 className="mb-10 text-[#1a1a2e] dark:text-white text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Split PDF
      </h1>

      {/* Drop Zone */}
      <div
        className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 mb-6 ${
          isDragging
            ? "border-[#4361ee] bg-blue-50 dark:bg-slate-800 scale-[1.02]"
            : "border-gray-300 bg-[#fafbfc] dark:bg-slate-900 dark:border-slate-700 hover:border-[#4361ee] hover:bg-blue-50"
        }`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => addFile(e.target.files)}
        />

        {file ? (
          /* File selected — show info + clear button */
          <div className="relative w-full flex flex-col items-center group">
            {/* PDF icon */}
            <svg
              className="w-16 h-16 text-[#4361ee] mb-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="8" y1="13" x2="16" y2="13" strokeLinecap="round" />
              <line x1="8" y1="17" x2="16" y2="17" strokeLinecap="round" />
              <line x1="8" y1="9" x2="11" y2="9" strokeLinecap="round" />
            </svg>

            {/* Remove button */}
            <button
              onClick={clearFile}
              className="absolute -top-1 -right-1 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
              aria-label="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div
              className="bg-[#f0f9ff] px-4 py-2 rounded-lg text-[#0369a1] font-semibold shadow-sm border-l-[3px] border-[#0ea5e9] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              title={file.name}
            >
              {file.name.length > 35
                ? `${file.name.substring(0, 32)}...`
                : file.name}
            </div>

            {totalPages !== null && (
              <span className="mt-2 text-xs text-gray-400 font-medium">
                {totalPages} page{totalPages !== 1 ? "s" : ""} detected
              </span>
            )}
          </div>
        ) : (
          /* Empty state */
          <>
            <svg
              className="w-16 h-16 text-[#4361ee] mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
              <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
            </svg>
            <p className="text-[#1a1a2e] dark:text-white font-semibold text-lg">
              {isDragging ? "Drop your PDF here" : "Choose a PDF file or drag & drop here"}
            </p>
            <p className="text-gray-400 dark:text-slate-400 text-sm">Single PDF · Pages will be detected automatically</p>
            <span className="mt-2 text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-300 rounded-full px-3 py-1 font-medium">
              PDF only
            </span>
          </>
        )}
      </div>

      {/* Page Range Inputs — shown only after a file is selected */}
      {file && (
        <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-left">
          <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#4361ee]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Select Page Range
            {totalPages !== null && (
              <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                1 – {totalPages}
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Page */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Start Page
              </span>
              <input
                type="number"
                min={1}
                max={totalPages ?? undefined}
                value={startPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setStartPage(val);
                  // If end is now less than start, bump end up
                  if (parseInt(val, 10) > parseInt(endPage, 10)) {
                    setEndPage(val);
                  }
                }}
                onBlur={(e) => {
                  const clamped = clamp(
                    e.target.value,
                    1,
                    totalPages ?? (parseInt(endPage, 10) || 1)
                  );
                  setStartPage(String(clamped));
                  if (clamped > parseInt(endPage, 10)) setEndPage(String(clamped));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
              />
            </label>

            {/* End Page */}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                End Page
              </span>
              <input
                type="number"
                min={parseInt(startPage, 10) || 1}
                max={totalPages ?? undefined}
                value={endPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setEndPage(val);
                }}
                onBlur={(e) => {
                  const sp = parseInt(startPage, 10) || 1;
                  const clamped = clamp(
                    e.target.value,
                    sp,
                    totalPages ?? Math.max(sp, parseInt(e.target.value, 10) || sp)
                  );
                  setEndPage(String(clamped));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[#1a1a2e] text-sm font-medium focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
              />
            </label>
          </div>

          {/* Summary pill */}
          {startPage && endPage && parseInt(startPage) <= parseInt(endPage) && (
            <p className="mt-3 text-xs text-[#4361ee] font-medium">
              ✦ Will extract{" "}
              <span className="font-bold">
                {Math.max(0, parseInt(endPage, 10) - parseInt(startPage, 10) + 1)}
              </span>{" "}
              page
              {parseInt(endPage, 10) - parseInt(startPage, 10) + 1 !== 1 ? "s" : ""}
              {" "}(
              {parseInt(startPage, 10) === parseInt(endPage, 10)
                ? `page ${startPage}`
                : `pages ${startPage} – ${endPage}`}
              )
            </p>
          )}
        </div>
      )}

      {/* Split Button — matches ToolPageTemplate button exactly */}
      <button
        onClick={handleSplit}
        disabled={!file || isLoading}
        className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin" />
            Splitting...
          </>
        ) : (
          "Split PDF"
        )}
      </button>

      {/* Status message — matches ToolPageTemplate exactly */}
      {statusMessage && (
        <p
          className={`mt-6 text-[0.95rem] ${
            statusType === "success"
              ? "text-green-600"
              : statusType === "error"
              ? "text-red-500"
              : "text-[#4b5563]"
          }`}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default PdfSplit;
