import { useState, useRef, useCallback } from "react";

function MergePdf() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfs.length === 0) {
      setStatusMessage("Only PDF files are accepted.");
      setStatusType("error");
      return;
    }
    setStatusMessage("");
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = pdfs.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setStatusMessage("Please add at least 2 PDF files to merge.");
      setStatusType("error");
      return;
    }
    setStatusMessage("");
    setIsLoading(true);
    setStatusType("info");

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/merge-pdf`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Merge failed. Please try again.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("PDFs merged successfully! File downloaded.");
      setStatusType("success");
      setFiles([]);
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      
      {/* Title — matches ToolPageTemplate exactly */}
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Merge PDFs
      </h1>

      {/* Drop Zone */}
      <div
        className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 mb-6
          ${isDragging
            ? "border-[#4361ee] bg-blue-50"
            : "border-gray-300 bg-[#fafbfc] hover:border-[#4361ee] hover:bg-blue-50"
          }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Upload icon */}
        <svg className="w-16 h-16 text-[#4361ee] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
          <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
        </svg>

        <p className="text-[#1a1a2e] font-semibold text-lg">
          {isDragging ? "Drop your PDFs here" : "Choose PDF files or drag & drop here"}
        </p>
        <p className="text-gray-400 text-sm">Click to browse or drop your PDF files</p>
        <span className="mt-2 text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1 font-medium">
          PDF only · Multiple files supported
        </span>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="w-full mb-6 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-600">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {files.map((file, i) => (
              <li
                key={file.name}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
              >
                {/* Order badge */}
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>

                {/* File icon */}
                <svg className="w-4 h-4 text-[#4361ee] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* Name */}
                <span className="flex-1 text-sm text-gray-700 text-left truncate" title={file.name}>
                  {file.name}
                </span>

                {/* Size */}
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>

                {/* Controls */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveFile(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >▲</button>
                  <button
                    onClick={() => moveFile(i, 1)}
                    disabled={i === files.length - 1}
                    className="w-6 h-6 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >▼</button>
                  <button
                    onClick={() => removeFile(i)}
                    className="w-6 h-6 rounded text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove"
                  >✕</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Merge Button — matches ToolPageTemplate button exactly */}
      <button
        onClick={handleMerge}
        disabled={files.length < 2 || isLoading}
        className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
            Merging...
          </>
        ) : (
          <>
            Merge PDFs
            {files.length >= 2 && (
              <span className="bg-white/30 rounded-full px-2 py-0.5 text-xs font-bold">
                {files.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Hint when only 1 file */}
      {files.length === 1 && (
        <p className="mt-3 text-xs text-[#4361ee]">
          Add at least one more PDF to enable merging.
        </p>
      )}

      {/* Status message — matches ToolPageTemplate exactly */}
      {statusMessage && (
        <p className={`mt-6 text-[0.95rem] ${
          statusType === "success"
            ? "text-green-600"
            : statusType === "error"
            ? "text-red-500"
            : "text-[#4b5563]"
        }`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}

export default MergePdf;