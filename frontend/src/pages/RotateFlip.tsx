import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastSuccess, toastError, parseApiError } from "../utils/toast";

const ACTIONS = [
  { id: "rotate_left",  label: "Rotate Left",     icon: "↺" },
  { id: "rotate_right", label: "Rotate Right",    icon: "↻" },
  { id: "flip_h",       label: "Flip Horizontal", icon: "⇋" },
  { id: "flip_v",       label: "Flip Vertical",   icon: "⇅" },
];

const FORMATS = ["PNG", "JPEG", "WEBP"];

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function RotateFlip() {
  const [format, setFormat] = useState("PNG");
  const [resultUrl, setResultUrl] = useState(null);
  const [resultExt, setResultExt] = useState("png");

  const validateFile = useCallback(async (selectedFile: any) => {
    setResultUrl(null); // Clear result when new file is selected
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return { isValid: true, message: `Image selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select an image file" };
  }, []);

  const handleClear = useCallback(() => {
    setResultUrl(null);
  }, []);

  const transform = async (action, file, setLoading) => {
    if (!file) return;
    setLoading(true);
    setResultUrl(null);

    const fd = new FormData();
    fd.append("image", file);
    fd.append("action", action);
    fd.append("format", format);

    try {
      const res = await fetch(`${API}/rotateFlip`, { method: "POST", body: fd });
      if (!res.ok) {
        const errorMsg = await parseApiError(null, res);
        throw new Error(errorMsg);
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setResultExt(format === "JPEG" ? "jpg" : format.toLowerCase());
      toastSuccess("Transformation applied successfully!");
    } catch (e) {
      toastError(e.message || "Transformation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const extraContent = ({ file, loading, setLoading }) => {
    if (!file) return null;

    return (
      <div className="w-full mt-6 text-left">
        {/* Output format */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <span className="text-[#111827] font-medium">Output format:</span>
          {FORMATS.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                className="accent-[#4361ee]"
              />
              <span className="text-[#4b5563]">{f}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {ACTIONS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => transform(id, file, setLoading)}
              disabled={!file || loading}
              className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl border text-sm font-medium transition-colors
                ${file && !loading
                  ? "border-[#c7d2fe] text-[#4361ee] hover:bg-[#4361ee] hover:text-white hover:shadow-md cursor-pointer"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
            >
              <span className="text-2xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Before / After */}
        {resultUrl && (
          <div className="flex flex-col items-center mt-6 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
            <h3 className="text-xl font-semibold text-[#111827] mb-4">Result</h3>
            <img
              src={resultUrl}
              alt="result"
              className="w-full rounded-xl border border-gray-200 object-contain max-h-96"
            />
            <a
              href={resultUrl}
              download={`transformed.${resultExt}`}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#16a34a] to-[#4ade80] px-8 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,185,129,0.22)] active:translate-y-0.5"
            >
              ⬇ Download
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Rotate & Flip"
      description="All processing is done in memory — no data is stored on the server."
      accept="image/png,image/jpeg,image/webp"
      validateFile={validateFile}
      onClear={handleClear}
      showSubmitButton={false}
      extraContent={extraContent}
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 2V6H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 13C20.3175 16.5414 17.5414 19.3175 14 20C9.58172 20.8787 5.12132 17.8787 4.24264 13.4604C3.36396 9.0421 6.36396 4.58172 10.7823 3.70304C13.8824 3.08643 17.0653 4.31681 19 6.78229L21 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="PNG · JPEG · WEBP"
      inputId="rotate-input"
    />
  );
}
