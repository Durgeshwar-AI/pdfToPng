import { useState } from "react";

function ImageBatch() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("webp");
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    formData.append("format", format);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/batchConvert`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch_converted.zip`;
        a.click();
        setStatus("Batch conversion successful! ZIP downloaded.");
      } else {
        setStatus("Error during batch conversion");
      }
    } catch (err) {
      setStatus("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col items-center bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Batch Image Converter</h1>
      <p className="text-gray-500 mb-8">Upload multiple images and download them as a ZIP.</p>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {files.length > 0 && (
          <div className="text-sm text-gray-600">
            {files.length} files selected
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <label className="flex items-center gap-2">
            <input type="radio" name="format" value="webp" checked={format === "webp"} onChange={() => setFormat("webp")} />
            WebP
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="format" value="jpeg" checked={format === "jpeg"} onChange={() => setFormat("jpeg")} />
            JPEG
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="format" value="png" checked={format === "png"} onChange={() => setFormat("png")} />
            PNG
          </label>
        </div>

        <button
          type="submit"
          disabled={files.length === 0 || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
        >
          {loading ? "Processing..." : "Convert All (ZIP)"}
        </button>

        {status && <p className="text-sm mt-4 text-blue-600">{status}</p>}
      </form>
    </div>
  );
}

export default ImageBatch;
