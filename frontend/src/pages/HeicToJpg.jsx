import React, { useState, useRef } from "react";
import heic2any from "heic2any";
import {
  Upload,
  Image as ImageIcon,
  Download,
  Settings,
  RefreshCw,
  FileImage,
} from "lucide-react";
import {
  toastSuccess,
  toastError,
  toastLoading,
  toastDismiss,
} from "../utils/toast";

export default function HeicToJpg() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [format, setFormat] = useState("image/jpeg"); // image/jpeg | image/png
  const [quality, setQuality] = useState(90); // 10 to 100
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

  // Handle file drop & selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (
      extension === "heic" ||
      extension === "heif" ||
      selectedFile.type === "image/heic" ||
      selectedFile.type === "image/heif"
    ) {
      setFile(selectedFile);
      setConvertedUrl(null);
      setConvertedSize(null);
    } else {
      toastError("Please select a valid HEIC or HEIF image file.");
    }
  };

  // Drag and drop event handlers
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

  // Clear states
  const handleClear = () => {
    setFile(null);
    setConvertedUrl(null);
    setConvertedSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Convert HEIC file using heic2any
  const handleConvert = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      toastError("Please upload a file first.");
      return;
    }

    setConverting(true);
    const toastId = toastLoading("Converting HEIC image client-side…");

    try {
      // Execute client-side conversion
      const conversionOptions = {
        blob: file,
        toType: format,
        quality: format === "image/jpeg" ? quality / 100 : undefined,
      };

      let result = await heic2any(conversionOptions);

      // Handle array responses if returned
      if (Array.isArray(result)) {
        result = result[0];
      }

      const url = URL.createObjectURL(result);
      setConvertedUrl(url);
      setConvertedSize(result.size);

      toastDismiss(toastId);
      toastSuccess("Image converted successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toastDismiss(toastId);
      toastError("Conversion failed. Please try a different HEIC file.");
    } finally {
      setConverting(false);
    }
  };

  // Download converted image
  const handleDownload = () => {
    if (!convertedUrl || !file) return;

    const baseName = file.name.substring(0, file.name.lastIndexOf("."));
    const ext = format === "image/jpeg" ? "jpg" : "png";
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
        HEIC to JPG/PNG
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-6 mb-10 max-w-xl">
        Convert Apple HEIC/HEIF images to standard JPG or PNG format client-side. Fast, free, and completely secure.
      </p>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Side: Upload & Options */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Upload card */}
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
                  accept=".heic,.heif,image/heic,image/heif"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4361ee]/10 to-[#7209b7]/10 flex items-center justify-center text-[#4361ee]">
                  <FileImage size={32} />
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-semibold text-lg">
                    Choose HEIC/HEIF file or drag & drop here
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Supports iOS .heic and .heif photos
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/40 flex flex-col items-center justify-center p-6 text-center relative">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-[#4361ee] mb-4">
                  <FileImage size={32} />
                </div>
                <p className="text-gray-800 dark:text-white font-semibold text-base break-all max-w-xs">
                  {file.name}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Original Size: {formatBytes(file.size)}
                </p>

                <button
                  onClick={handleClear}
                  disabled={converting}
                  className="mt-6 px-4 py-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove File
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
              {/* Output format select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Format
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-full max-w-xs shadow-inner">
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
                  <button
                    onClick={() => setFormat("image/png")}
                    disabled={converting}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      format === "image/png"
                        ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                </div>
              </div>

              {/* Quality slider (JPEG only) */}
              {format === "image/jpeg" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      JPEG Quality
                    </label>
                    <span className="text-xs font-bold text-[#4361ee] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={converting}
                    className="w-full accent-[#4361ee] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    <span>Small size</span>
                    <span>High quality</span>
                  </div>
                </div>
              )}
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
                  Convert Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Preview & Download */}
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
                  alt="Converted output"
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
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  <Download size={16} />
                  Download Converted Image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
              <ImageIcon size={48} className="stroke-[1] mb-3 animate-pulse" />
              <p className="font-medium text-sm">Awaiting Conversion</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[240px]">
                Once you upload your HEIC image and click convert, your download preview will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
