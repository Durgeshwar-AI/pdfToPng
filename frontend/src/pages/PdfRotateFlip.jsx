import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ACTIONS = [
  { id: "rotate_left",  label: "Rotate Left",     icon: "↺" },
  { id: "rotate_right", label: "Rotate Right",    icon: "↻" },
  { id: "flip_h",       label: "Flip Horizontal", icon: "⇋" },
  { id: "flip_v",       label: "Flip Vertical",   icon: "⇅" },
];

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function PdfRotateFlip() {
  const [file, setFile] = useState(null);
  const [scope, setScope] = useState("all");
  const [pages, setPages] = useState("");
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const inputRef = useRef();

  const pickFile = async (f) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }

    setFile(f);
    setResultUrl(null);
    setError(null);
    setScope("all");
    setPages("");

    try {
      const bytes = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      setTotalPages(pdf.numPages);
    } catch {
      setTotalPages(null);
      setError("Unable to read PDF page count.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files[0]);
  };

  const transform = async (action) => {
    if (!file || loading) return;
    if (scope === "selection" && !pages.trim()) {
      setError("Enter pages like 1,3,7 or 1-10 for selected-page mode.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("action", action);
    fd.append("scope", scope);
    if (scope === "selection") fd.append("pages", pages.trim());

    try {
      const res = await fetch(`${API}/rotateFlipPdf`, { method: "POST", body: fd });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Transformation failed");
      }
      const blob = await res.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const scopeLabel = scope === "all" ? "All" : "Selected";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-2xl">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Rotate & Flip</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Rotate or flip all pages, or only selected pages (e.g. 1,3,7 or 1-10).
          Processing is done in memory — nothing is stored on the server.
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="w-full border-2 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all mb-6"
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files[0])}
          />
          {file ? (
            <p className="text-gray-700 font-medium">
              📄 {file.name}{" "}
              {typeof totalPages === "number" && (
                <span className="text-gray-500 text-sm">
                  ({totalPages} page{totalPages !== 1 ? "s" : ""})
                </span>
              )}
              <span className="text-blue-400 text-sm ml-2">click to change</span>
            </p>
          ) : (
            <>
              <p className="text-gray-500 font-medium">Click or drag & drop a PDF here</p>
              <p className="text-gray-400 text-sm mt-1">PDF only</p>
            </>
          )}
        </div>

        {file && (
          <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-medium text-gray-700">Apply action to:</span>
              <div className="flex rounded-lg border border-blue-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className={`px-3 py-1.5 text-sm ${scope === "all" ? "bg-blue-600 text-white" : "bg-white text-blue-700"}`}
                >
                  All pages
                </button>
                <button
                  type="button"
                  onClick={() => setScope("selection")}
                  className={`px-3 py-1.5 text-sm ${scope === "selection" ? "bg-blue-600 text-white" : "bg-white text-blue-700"}`}
                >
                  Selected pages
                </button>
              </div>
            </div>

            {scope === "selection" && (
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="e.g. 1,3,7 or 1-10 or 1-3,7,10-12"
                className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            )}
          </div>
        )}

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
              {label} ({scopeLabel})
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-blue-500 text-sm mb-4 animate-pulse">Processing…</p>
        )}
        {error && (
          <p className="text-red-500 text-sm mb-4">Error: {error}</p>
        )}

        {resultUrl && (
          <div className="flex flex-col items-center">
            <div className="w-full rounded-xl border border-gray-200 p-6 bg-gray-50 text-center text-gray-600 text-sm mb-4">
              PDF transformation complete. Download your file below.
            </div>
            <a
              href={resultUrl}
              download={`${file.name.replace(/\.pdf$/i, "")}_transformed.pdf`}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ⬇ Download PDF
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
