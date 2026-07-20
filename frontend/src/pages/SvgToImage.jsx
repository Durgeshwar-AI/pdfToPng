import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Download,
  Settings,
  RefreshCw,
  FileCode,
  Gauge,
} from "lucide-react";
import {
  toastSuccess,
  toastError,
  toastLoading,
  toastDismiss,
} from "../utils/toast";

export default function SvgToImage() {
  const [file, setFile] = useState(null);
  const [svgContent, setSvgContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [format, setFormat] = useState("image/png"); // image/png | image/jpeg
  const [scale, setScale] = useState(2); // 1x, 2x, 3x, 4x multiplier
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);
  const fileInputRef = useRef(null);

  // Helper to format file sizes
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Validate and read SVG file
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (extension === "svg" || selectedFile.type === "image/svg+xml") {
      setFile(selectedFile);
      setConvertedUrl(null);
      setConvertedSize(null);

      // Read file as text to check/parse dimensions
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgContent(e.target.result);
      };
      reader.onerror = () => {
        toastError("Failed to read SVG file content.");
      };
      reader.readAsText(selectedFile);
    } else {
      toastError("Please select a valid SVG vector file.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleClear = () => {
    setFile(null);
    setSvgContent("");
    setConvertedUrl(null);
    setConvertedSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Process SVG to PNG/JPG on Canvas
  const handleConvert = (e) => {
    if (e) e.preventDefault();
    if (!file || !svgContent) {
      toastError("Please upload an SVG file first.");
      return;
    }

    setConverting(true);
    const toastId = toastLoading("Processing vector conversion…");

    try {
      // Parse SVG structure using DOMParser to identify base dimensions
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (!svgElement) {
        throw new Error("Invalid SVG content.");
      }

      // Try parsing attributes, viewBox, or fallback
      let rawWidth = svgElement.getAttribute("width");
      let rawHeight = svgElement.getAttribute("height");

      if (!rawWidth || !rawHeight) {
        const viewBox = svgElement.getAttribute("viewBox");
        if (viewBox) {
          const parts = viewBox.split(/\s+/);
          if (parts.length === 4) {
            rawWidth = rawWidth || parts[2];
            rawHeight = rawHeight || parts[3];
          }
        }
      }

      // Final default fallbacks
      const baseWidth = parseFloat(rawWidth) || 300;
      const baseHeight = parseFloat(rawHeight) || 300;

      // Create blob from SVG text
      const svgBlob = new Blob([svgContent], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Scale canvas for high-density rendering
        canvas.width = baseWidth * scale;
        canvas.height = baseHeight * scale;

        if (!ctx) {
          URL.revokeObjectURL(url);
          throw new Error("Failed to initialize canvas context.");
        }

        // Draw solid background if converting to JPEG (since JPEG doesn't support transparency)
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw SVG image scaled onto canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const outputUrl = URL.createObjectURL(blob);
            setConvertedUrl(outputUrl);
            setConvertedSize(blob.size);
            toastDismiss(toastId);
            toastSuccess("Vector converted to raster successfully!");
          } else {
            toastDismiss(toastId);
            toastError("Failed to convert image blob.");
          }
          URL.revokeObjectURL(url);
          setConverting(false);
        }, format);
      };

      img.onerror = () => {
        toastDismiss(toastId);
        toastError("Failed to render SVG vector path.");
        URL.revokeObjectURL(url);
        setConverting(false);
      };

      img.src = url;
    } catch (error) {
      console.error("SVG Conversion failed:", error);
      toastDismiss(toastId);
      toastError("Could not convert SVG. Ensure the vector file is valid.");
      setConverting(false);
    }
  };

  // Download converted file
  const handleDownload = () => {
    if (!convertedUrl || !file) return;

    const baseName = file.name.substring(0, file.name.lastIndexOf("."));
    const ext = format === "image/png" ? "png" : "jpg";
    const downloadName = `${baseName}_converted.${ext}`;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-10 text-center flex flex-col items-center">
      {/* Title */}
      <h1 className="mb-4 text-[#1a1a2e] dark:text-white text-4xl md:text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        SVG to PNG/JPG
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-6 mb-10 max-w-xl">
        Convert SVG vector paths to crisp raster images. Customize output formats and resolution multipliers up to 4x client-side.
      </p>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Column: Upload & Options */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-6 shadow-sm">
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-250 ${
                  isDragging
                    ? "border-[#4361ee] bg-blue-50/30 dark:bg-blue-900/10"
                    : "border-gray-300 dark:border-gray-600 hover:border-[#4361ee] hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".svg,image/svg+xml"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4361ee]/10 to-[#7209b7]/10 flex items-center justify-center text-[#4361ee]">
                  <FileCode size={32} />
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold text-lg">
                    Choose SVG file or drag & drop here
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Supports raw vector .svg files
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex flex-col items-center justify-center p-6 text-center relative">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-[#4361ee] mb-4">
                  <FileCode size={32} />
                </div>
                <p className="text-gray-800 dark:text-white font-semibold text-base break-all max-w-xs">
                  {file.name}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  File Size: {formatBytes(file.size)}
                </p>

                <button
                  onClick={handleClear}
                  disabled={converting}
                  className="mt-6 px-4 py-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  Remove Vector
                </button>
              </div>
            )}
          </div>

          {/* Options Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-6 shadow-sm text-left flex-1 flex flex-col justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#4361ee]" />
              Conversion Settings
            </h2>

            <div className="space-y-6 flex-1">
              {/* Output format selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Format
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-full max-w-xs shadow-inner">
                  <button
                    onClick={() => setFormat("image/png")}
                    disabled={converting}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      format === "image/png"
                        ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    }`}
                  >
                    PNG (Transparent)
                  </button>
                  <button
                    onClick={() => setFormat("image/jpeg")}
                    disabled={converting}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      format === "image/jpeg"
                        ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    }`}
                  >
                    JPEG / JPG
                  </button>
                </div>
              </div>

              {/* Scale slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Gauge size={14} />
                    Output Scale Resolution
                  </label>
                  <span className="text-xs font-bold text-[#4361ee] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                    {scale}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  disabled={converting}
                  className="w-full accent-[#4361ee] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  <span>Standard (1x)</span>
                  <span>Retina (2x)</span>
                  <span>Ultra-HD (4x)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={!file || converting}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {converting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Converting...
                </>
              ) : (
                <>
                  <Settings size={16} />
                  Rasterize Vector
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Preview & Download */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-6 shadow-sm flex flex-col min-h-[350px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-left border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#4361ee]" />
            Conversion Preview
          </h2>

          {convertedUrl ? (
            <div className="flex-1 flex flex-col justify-between items-center w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-full flex-1 flex items-center justify-center p-4 border border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/30 rounded-xl max-h-[320px] overflow-hidden">
                <img
                  src={convertedUrl}
                  alt="Converted output preview"
                  className="max-w-full max-h-64 object-contain rounded-lg shadow-sm"
                />
              </div>

              <div className="w-full mt-6 space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Output Size</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {formatBytes(convertedSize)}
                  </span>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Download size={16} />
                  Download Raster Image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
              <ImageIcon size={48} className="stroke-[1] mb-3 animate-pulse" />
              <p className="font-medium text-sm">Awaiting Rasterization</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[240px]">
                Once you select your vector file and settings, your download preview will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
