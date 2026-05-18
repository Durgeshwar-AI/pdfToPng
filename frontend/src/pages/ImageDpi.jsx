import { useState, useRef } from "react";

const PRESET_DPIS = [72, 96, 150, 300, 600];

const ImageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default function ImageDpi() {
  const [files, setFiles] = useState([]);
  const [dpi, setDpi] = useState(300);
  const [resample, setResample] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [isDragging, setIsDragging] = useState(false);
  const [dpiResults, setDpiResults] = useState([]);
  const inputRef = useRef();
  const dropAreaRef = useRef();

  const ACCEPTED = ["image/jpeg", "image/png", "image/tiff", "image/bmp"];

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => ACCEPTED.includes(f.type)).slice(0, 1);
    if (!valid.length) {
      setStatusMessage("Error: Please select valid image files (JPEG, PNG, TIFF, BMP, WebP)");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
    setStatusMessage("");
    setDpiResults([]);
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setDpiResults([]);
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget)) setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const handleAreaClick = () => inputRef.current.click();

  const handleConvert = async () => {
    if (!files.length) return;
    setLoading(true);
    setStatusMessage("");
    setDpiResults([]);

    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    form.append("dpi", dpi);
    form.append("resample", resample);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/convert-dpi`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Conversion failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        files.length === 1
          ? `${files[0].name.replace(/\.[^.]+$/, "")}_${dpi}dpi${files[0].name.match(/\.[^.]+$/)[0]}`
          : `converted_${dpi}dpi.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage(`Success! ${files.length} image(s) converted to ${dpi} DPI and downloaded.`);
      setStatusType("success");
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (err) {
      setStatusMessage(`Error: ${err.message || "Conversion failed"}`);
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDpi = async () => {
    if (!files.length) return;
    setLoading(true);
    setStatusMessage("");
    setDpiResults([]);

    const form = new FormData();
    files.forEach((f) => form.append("images", f));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/check-dpi`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setDpiResults(data);
    } catch {
      setStatusMessage("Error: Failed to check DPI.");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">

      {/* Title */}
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image DPI Converter
      </h1>

      <div className="w-full flex flex-col items-center">

        {/* Drop area */}
        <div
          ref={dropAreaRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
          className={`w-full border-2 border-dashed rounded-2xl p-8 mb-6 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
            isDragging
              ? "border-[#3b82f6] bg-[#ebf5ff] scale-[1.02]"
              : "border-[#c7d2fe] bg-[rgba(239,246,255,0.6)] hover:border-[#4361ee] hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(67,97,238,0.1)] hover:bg-[rgba(229,240,255,0.8)]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.tiff,.tif,.bmp"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />

          {files.length === 0 ? (
            <label className="flex flex-col items-center text-xl text-[#4b5563] cursor-pointer font-medium">
              <div className="text-[2.5rem] text-[#4361ee] mb-4">
                <ImageIcon />
              </div>
              Choose image files or drag & drop here
              <div className="text-[0.95rem] text-[#6b7280] mt-3">
                Supports JPG, JPEG, PNG, TIFF, TIF, BMP
              </div>
            </label>
          ) : (
            <div className="w-full flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              {files.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between bg-[#f0f9ff] px-4 py-2 rounded-lg border-l-[3px] border-[#0ea5e9] shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
                >
                  <span
                    className="text-[#0369a1] font-semibold text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[85%]"
                    title={f.name}
                  >
                    {f.name.length > 40 ? `${f.name.substring(0, 37)}...` : f.name}
                  </span>
                  <button
                    onClick={() => removeFile(f.name)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow hover:bg-red-700 transition-all duration-200 hover:scale-110 flex-shrink-0"
                    aria-label="Remove file"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DPI Settings */}
        <div className="w-full bg-[rgba(239,246,255,0.8)] border border-[#c7d2fe] rounded-2xl p-6 mb-6 text-left">

          {/* Preset buttons */}
          <p className="text-sm font-semibold text-[#1a1a2e] mb-3">Target DPI</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {PRESET_DPIS.map((p) => (
              <button
                key={p}
                onClick={() => setDpi(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  dpi === p
                    ? "bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white border-transparent shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                    : "bg-white text-[#4361ee] border-[#c7d2fe] hover:border-[#4361ee]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Custom DPI input */}
          <div className="flex items-center gap-3 mb-5">
            <input
              type="number"
              min={1}
              max={2400}
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-[#c7d2fe] bg-white text-[#1a1a2e] text-sm focus:outline-none focus:border-[#4361ee]"
            />
            <span className="text-sm text-[#6b7280]">Custom value (1 – 2400)</span>
          </div>

          {/* Resample checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={resample}
              onChange={(e) => setResample(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#4361ee]"
            />
            <div>
              <span className="text-sm font-semibold text-[#1a1a2e]">Resize pixel dimensions</span>
              <p className="text-xs text-[#6b7280] mt-0.5">
                When enabled, pixel count scales with DPI (e.g. 72→300 DPI makes the image ~4× larger in pixels)
              </p>
            </div>
          </label>
        </div>

        {/* Info note */}
        <div className="w-full bg-[#fffbeb] border-l-4 border-[#f59e0b] px-4 py-3 rounded-r-xl mb-6 text-left">
          <p className="text-xs text-[#92400e]">
            <span className="font-semibold">Note: </span>
            Changing DPI without resampling only updates metadata, pixel count stays the same. This affects print size, not screen display.
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={handleCheckDpi}
            disabled={!files.length || loading}
            className="flex-1 py-3.5 px-6 border-2 border-[#4361ee] text-[#4361ee] bg-white rounded-lg text-base font-semibold transition-all duration-300 hover:enabled:bg-[#eef2ff] hover:enabled:-translate-y-0.5 disabled:border-[#cbd5e1] disabled:text-[#94a3b8] disabled:cursor-not-allowed"
          >
            {loading ? "Checking…" : "Check DPI"}
          </button>

          <button
            onClick={handleConvert}
            disabled={!files.length || loading}
            className="flex-1 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-6 border-none rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2"></span>
                Converting…
              </>
            ) : (
              `Convert to ${dpi} DPI`
            )}
          </button>
        </div>

        {/* Status message */}
        {statusMessage && (
          <p className={`mt-6 text-[0.95rem] ${statusType === "success" ? "text-green-600" : statusType === "error" ? "text-red-500" : "text-[#4b5563]"}`}>
            {statusMessage}
          </p>
        )}

        {/* Check DPI results */}
        {dpiResults.length > 0 && (
          <div className="w-full mt-6 flex flex-col gap-2">
            {dpiResults.map((r, i) => (
              <div
                key={i}
                className={`px-4 py-3 rounded-lg text-sm text-left border-l-4 ${
                  r.error
                    ? "bg-red-50 border-red-400 text-red-700"
                    : "bg-[#f0f9ff] border-[#0ea5e9] text-[#0369a1]"
                }`}
              >
                {r.error ? (
                  <span><span className="font-semibold">{r.filename}</span>: {r.error}</span>
                ) : (
                  <span>
                    <span className="font-semibold">{r.filename}</span>
                    {" — "}
                    <span className="font-semibold">{r.dpi[0]} DPI</span>
                    {" · "}
                    {r.width_px} × {r.height_px} px
                    {" · "}
                    {r.format}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}