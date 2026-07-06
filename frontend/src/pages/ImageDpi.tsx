import { useState, useCallback } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastSuccess, toastError } from "../utils/toast";

const PRESET_DPIS = [72, 96, 150, 300, 600];

const ImageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default function ImageDpi() {
  const [dpi, setDpi] = useState(300);
  const [resample, setResample] = useState(false);
  const [dpiResults, setDpiResults] = useState([]);

  const validateFile = useCallback(async (selectedFile: any) => {
    const ACCEPTED = ["image/jpeg", "image/png", "image/tiff", "image/bmp", "image/jpg"];
    if (selectedFile && ACCEPTED.includes(selectedFile.type)) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select valid image files (JPEG, PNG, TIFF, BMP)",
    };
  }, []);

  const handleClear = () => {
    setDpiResults([]);
  };

  const handleCheckDpi = async (file, setLoading) => {
    if (!file) return;
    setLoading(true);
    setDpiResults([]);

    const form = new FormData();
    form.append("images", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/check-dpi`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to check DPI");
      const data = await res.json();
      setDpiResults(data);
    } catch {
      toastError("Failed to check DPI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (file, setLoading) => {
    if (!file) return;
    setLoading(true);
    setDpiResults([]);

    const form = new FormData();
    form.append("images", file);
    form.append("dpi", dpi.toString());
    form.append("resample", resample.toString());

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
      
      const fileExt = file.name.match(/\.[^.]+$/)?.[0] || ".jpg";
      const baseName = file.name.replace(/\.[^.]+$/, "");
      a.download = `${baseName}_${dpi}dpi${fileExt}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toastSuccess(`Image converted to ${dpi} DPI and downloaded!`);
    } catch (err) {
      toastError(err.message || "DPI conversion failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extraFields = ({ file }) => {
    if (!file) return null;
    return (
      <div className="w-full bg-[rgba(239,246,255,0.8)] border border-[#c7d2fe] rounded-2xl p-6 mb-6 text-left">
        {/* Preset buttons */}
        <p className="text-sm font-semibold text-[#1a1a2e] mb-3">Target DPI</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {PRESET_DPIS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDpi(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 cursor-pointer ${
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
    );
  };

  const extraContent = ({ file, loading, setLoading }) => {
    if (!file) return null;
    return (
      <div className="w-full text-left">
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
            type="button"
            onClick={() => handleCheckDpi(file, setLoading)}
            disabled={loading}
            className="flex-1 py-3.5 px-6 border-2 border-[#4361ee] text-[#4361ee] bg-white rounded-lg text-base font-semibold transition-colors duration-300 hover:enabled:bg-[#eef2ff] hover:enabled:-translate-y-0.5 disabled:border-[#cbd5e1] disabled:text-[#94a3b8] disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Checking…" : "Check DPI"}
          </button>

          <button
            type="button"
            onClick={() => handleConvert(file, setLoading)}
            disabled={loading}
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
                    <span className="font-semibold">{r.dpi ? r.dpi[0] : 72} DPI</span>
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
    );
  };

  return (
    <ToolPageTemplate
      title="Image DPI Converter"
      description="Change image DPI metadata or resample pixels"
      accept=".jpg,.jpeg,.png,.tiff,.tif,.bmp"
      validateFile={validateFile}
      onClear={handleClear}
      showSubmitButton={false}
      extraFields={extraFields}
      extraContent={extraContent}
      maxWidthClass="max-w-[600px]"
      inputId="file-input"
      defaultIcon={<ImageIcon />}
      defaultText="Choose image files or drag & drop here"
      supportText="Supports JPG, JPEG, PNG, TIFF, TIF, BMP"
    />
  );
}
