import { useState, useRef } from "react";

const ACTIONS = [
  { id: "rotate_left",  label: "Rotate Left",     icon: "↺" },
  { id: "rotate_right", label: "Rotate Right",    icon: "↻" },
  { id: "flip_h",       label: "Flip Horizontal", icon: "⇋" },
  { id: "flip_v",       label: "Flip Vertical",   icon: "⇅" },
];

const FORMATS = ["PNG", "JPEG", "WEBP"];

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function RotateFlip() {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [format, setFormat]       = useState("PNG");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultExt, setResultExt] = useState("png");
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files[0]);
  };

  const transform = async (action) => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    const fd = new FormData();
    fd.append("image", file);
    fd.append("action", action);
    fd.append("format", format);

    try {
      const res = await fetch(`${API}/rotateFlip`, { method: "POST", body: fd });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Transformation failed");
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
      setResultExt(format === "JPEG" ? "jpg" : format.toLowerCase());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-2xl">

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rotate & Flip</h1>
        <p className="text-gray-500 mb-8 text-sm">
          All processing is done in memory — no data is stored on the server.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="w-full border-2 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all mb-6"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => pickFile(e.target.files[0])}
          />
          {file ? (
            <p className="text-gray-700 font-medium">
              📄 {file.name} <span className="text-blue-400 text-sm ml-2">click to change</span>
            </p>
          ) : (
            <>
              <p className="text-gray-500 font-medium">Click or drag & drop an image here</p>
              <p className="text-gray-400 text-sm mt-1">PNG · JPEG · WEBP</p>
            </>
          )}
        </div>

        {/* Output format */}
        <div className="flex items-center gap-6 mb-6">
          <span className="text-gray-700 font-medium">Output format:</span>
          {FORMATS.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                className="accent-blue-500"
              />
              <span className="text-gray-700">{f}</span>
            </label>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {ACTIONS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => transform(id)}
              disabled={!file || loading}
              className={`flex flex-col items-center justify-center gap-1 p-4 rounded-xl border text-sm font-medium transition-all
                ${file && !loading
                  ? "border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md cursor-pointer"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
            >
              <span className="text-2xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Status */}
        {loading && (
          <p className="text-blue-500 text-sm mb-4 animate-pulse">Processing…</p>
        )}
        {error && (
          <p className="text-red-500 text-sm mb-4">Error: {error}</p>
        )}

        {/* Before / After */}
        {(preview || resultUrl) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {preview && (
              <div className="flex flex-col items-center">
                <p className="text-gray-500 text-sm font-medium mb-2">Original</p>
                <img
                  src={preview}
                  alt="original"
                  className="w-full rounded-xl border border-gray-200 object-contain max-h-64"
                />
              </div>
            )}
            {resultUrl && (
              <div className="flex flex-col items-center">
                <p className="text-gray-500 text-sm font-medium mb-2">Result</p>
                <img
                  src={resultUrl}
                  alt="result"
                  className="w-full rounded-xl border border-gray-200 object-contain max-h-64"
                />
                
                  <a href={resultUrl}
                  download={`transformed.${resultExt}`}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ⬇ Download
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
