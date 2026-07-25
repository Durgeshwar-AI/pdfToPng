import React, { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import {
  QrCode,
  Upload,
  Camera,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  VideoOff,
} from "lucide-react";
import {
  toastSuccess,
  toastError,
  toastLoading,
  toastDismiss,
} from "../utils/toast";

export default function QrReader() {
  const [activeTab, setActiveTab] = useState("upload"); // upload | camera
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraPermission, setCameraPermission] = useState("unknown"); // unknown | granted | denied

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Helper to validate if string is a URL
  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Helper to copy to clipboard
  const handleCopy = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult);
    setCopied(true);
    toastSuccess("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Switch tabs and clean up resources
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setScanResult(null);
    stopCamera();
  };

  // Stop camera stream and scan loop
  const stopCamera = useCallback(() => {
    setScanning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Decode QR from Image file
  const decodeImageFile = (file) => {
    if (!file) return;

    const loadingId = toastLoading("Reading QR Code…");
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        if (!ctx) {
          toastDismiss(loadingId);
          toastError("Failed to initialize canvas context.");
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        toastDismiss(loadingId);
        if (code) {
          setScanResult(code.data);
          toastSuccess("QR Code decoded successfully!");
        } else {
          setScanResult(null);
          toastError("No QR Code found in this image.");
        }
      };

      img.onerror = () => {
        toastDismiss(loadingId);
        toastError("Failed to load image file.");
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      toastDismiss(loadingId);
      toastError("Failed to read file.");
    };

    reader.readAsDataURL(file);
  };

  // Handle file input selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      decodeImageFile(selectedFile);
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
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      decodeImageFile(droppedFile);
    } else {
      toastError("Please upload a valid image file.");
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setScanResult(null);
    setScanning(true);
    setCameraPermission("unknown");

    try {
      const constraints = {
        video: { facingMode: "environment" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Start decoding frame loop
        animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setScanning(false);
      setCameraPermission("denied");
      toastError("Camera access denied or unavailable.");
    }
  };

  // Loop to capture and scan video frames
  const scanVideoFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setScanResult(code.data);
        toastSuccess("QR Code scanned successfully!");
        stopCamera();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-10 theme-panel rounded-2xl overflow-hidden flex flex-col items-center">
      {/* Title */}
      <h1 className="mb-4 text-[#1a1a2e] dark:text-white text-4xl md:text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-16 after:h-1.5 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        QR Code Reader
      </h1>
      <p className="theme-muted mt-6 mb-10 max-w-xl">
        Scan QR codes instantly in your browser using a webcam/camera or by uploading an image. 100% client-side and privacy-secure.
      </p>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-full max-w-md mb-10 shadow-sm">
        <button
          onClick={() => handleTabChange("upload")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "upload"
              ? "bg-white dark:bg-gray-700 text-[#1a1a2e] dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          }`}
        >
          <Upload size={16} />
          Upload Image
        </button>
        <button
          onClick={() => handleTabChange("camera")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "camera"
              ? "bg-white dark:bg-gray-700 text-[#1a1a2e] dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          }`}
        >
          <Camera size={16} />
          Scan via Camera
        </button>
      </div>

      {/* Grid Layout for controls & results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Side: Scan Interface */}
        <div className="theme-card rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-center min-h-[350px]">
          {activeTab === "upload" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-250 ${
                isDragging
                  ? "border-[#4361ee] bg-blue-50/30 dark:bg-blue-900/10"
                  : "border-gray-300 dark:border-gray-600 hover:border-[#4361ee] hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4361ee]/10 to-[#7209b7]/10 flex items-center justify-center text-[#4361ee]">
                <QrCode size={32} />
              </div>
              <div>
                <p className="text-[var(--color-app-text)] font-semibold text-lg">
                  Choose image file or drag & drop here
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Supports PNG, JPG, JPEG, WEBP formats
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 w-full">
              {scanning ? (
                <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Glowing scan target overlay */}
                  <div className="absolute inset-8 border border-white/30 rounded-lg pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-[#4361ee] border-dashed rounded-lg animate-pulse" />
                  </div>
                  {/* Laser line animation */}
                  <div className="absolute left-0 w-full h-0.5 bg-[#4361ee] opacity-80 shadow-[0_0_8px_#4361ee] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              ) : (
                <div className="w-full max-w-sm aspect-square bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                    <VideoOff size={28} />
                  </div>
                  {cameraPermission === "denied" ? (
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Camera Access Denied</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
                        Please enable camera permissions in your browser settings to scan QR codes live.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">Camera is Ready</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Grant camera permission to begin scanning.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {scanning ? (
                <button
                  onClick={stopCamera}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Stop Scanning
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  <Camera size={16} />
                  Start Camera Scanner
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Results Display */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col min-h-[350px]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-left border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#4361ee]" />
            Decoded Results
          </h2>

          {scanResult ? (
            <div className="flex-1 flex flex-col justify-between text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Content Type
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isValidUrl(scanResult)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}>
                    {isValidUrl(scanResult) ? "URL / Link" : "Text"}
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 max-h-[180px] overflow-y-auto font-mono text-sm text-gray-700 dark:text-gray-300 break-all select-all leading-relaxed whitespace-pre-wrap">
                  {scanResult}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 theme-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  {copied ? <Check className="text-green-500" size={16} /> : <Copy size={16} />}
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>

                {isValidUrl(scanResult) ? (
                  <a
                    href={scanResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white hover:opacity-95 rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <ExternalLink size={16} />
                    Visit Website
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-xl text-sm font-semibold cursor-not-allowed opacity-50"
                  >
                    <ExternalLink size={16} />
                    Not a Link
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
              <QrCode size={48} className="stroke-[1] mb-3 animate-pulse" />
              <p className="font-medium text-sm">Awaiting Scan / Upload</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[240px]">
                Provide a QR Code image or launch the camera to extract data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Embedded scanning scanner animation style */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 8%; }
          50% { top: 92%; }
        }
      `}</style>
    </div>
  );
}
