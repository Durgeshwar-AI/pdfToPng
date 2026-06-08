import React, { useState, useRef, useCallback } from "react";

const POSITION_OPTIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

function ImageWatermark() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState(null);

  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(60);
  const [size, setSize] = useState(30);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error

  const inputRef = useRef(null);
  const imageInputRef = useRef(null);

  const resetStatus = () => {
    setStatusMessage("");
    setStatusType("info");
  };

  const handleImageUpload = useCallback((incoming) => {
    const img = Array.from(incoming).find((f) => f.type?.startsWith("image/"));
    if (!img) {
      setStatusMessage("Only image files are accepted.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setFile(img);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(img);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    resetStatus();
  };

  const clearWatermarkImage = () => {
    setWatermarkImage(null);
    resetStatus();
  };

  const handleWatermarkImageUpload = (e) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(imageFile.type)) {
      setStatusMessage("Watermark image must be a PNG or JPG file.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setWatermarkImage(imageFile);
  };

  const applyWatermark = async () => {
    if (!file) {
      setStatusMessage("Upload an image to add watermark.");
      setStatusType("error");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      setStatusMessage("Upload a watermark image to continue.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setIsLoading(true);
    setStatusType("info");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("watermark_type", watermarkType);
      formData.append("position", position);
      formData.append("opacity", opacity);
      formData.append("size", size);

      if (watermarkType === "text") {
        formData.append("watermark_text", watermarkText);
      } else {
        formData.append("watermark_image", watermarkImage);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/add-watermark`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Processing failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "watermarked.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage("Image watermarked successfully! File downloaded.");
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
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image Watermark
      </h1>

      <div
        className={`w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 mb-6 ${
          isDragging
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
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />

        <svg className="w-16 h-16 text-[#4361ee] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <p className="text-[#1a1a2e] font-semibold text-lg">{isDragging ? "Drop your image here" : "Choose an image or drag & drop here"}</p>
        <p className="text-gray-400 text-sm">Click to browse or drop your image</p>
        <span className="mt-2 text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1 font-medium">PNG · JPG supported</span>
      </div>

      {file && (
        <div className="w-full mb-6 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-600">1 file selected</span>
            <button onClick={clearFile} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
          </div>

          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
            <span className="flex-1 text-sm text-gray-700 text-left truncate" title={file.name}>{file.name}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}

      <div className="w-full mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-[0.2em] mb-3">Watermark Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setWatermarkType("text"); resetStatus(); }}
                className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                  watermarkType === "text"
                    ? "border-[#4361ee] bg-[#eff6ff] text-[#1a1a2e]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#4361ee]"
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => { setWatermarkType("image"); resetStatus(); }}
                className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                  watermarkType === "image"
                    ? "border-[#4361ee] bg-[#eff6ff] text-[#1a1a2e]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-[#4361ee]"
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {watermarkType === "text" ? (
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold">Watermark Text</span>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
                placeholder="Enter watermark text"
              />
            </label>
          ) : (
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#1a1a2e] shadow-sm transition-colors hover:border-[#4361ee] hover:text-[#4361ee]"
                >
                  Upload watermark image
                </button>
                {watermarkImage ? (
                  <button type="button" onClick={clearWatermarkImage} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                ) : null}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleWatermarkImageUpload}
              />
              {watermarkImage ? (
                <div className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-3 text-sm text-gray-700">{watermarkImage.name}</div>
              ) : (
                <p className="text-xs text-gray-500">PNG or JPG logo file for watermark.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold">Position</span>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 transition-all"
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold">Opacity</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
                />
                <span className="min-w-[42px] text-sm font-semibold text-gray-700">{opacity}%</span>
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-gray-700">
            <span className="font-semibold">Size</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
                />
              <span className="min-w-[42px] text-sm font-semibold text-gray-700">{size}%</span>
            </div>
            <p className="text-xs text-gray-500">Adjust the watermark size relative to image dimensions.</p>
          </label>
        </div>
      </div>

      <button
        onClick={applyWatermark}
        disabled={!file || isLoading}
        className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin"></span>
            Processing...
          </>
        ) : (
          "Apply Watermark"
        )}
      </button>

      {!file && (
        <p className="mt-3 text-xs text-[#4361ee]">Upload an image to add watermark.</p>
      )}

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

export default ImageWatermark;