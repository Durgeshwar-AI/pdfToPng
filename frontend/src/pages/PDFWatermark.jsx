import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useCallback, useRef, useState } from "react";
import OutputFilenameInput from "../components/OutputFilenameInput";
import { useDownloadFilename } from "../hooks/useDownloadFilename";
import { triggerDownload } from "../utils/downloadFile";

const POSITION_OPTIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

function PDFWatermark() {
  const [file, setFile] = useState(null);
  const { downloadFilename, setDownloadFilename, resetDownloadFilename, resolveFilename } =
    useDownloadFilename({
      originalName: file?.name,
      tool: "watermarked",
      extension: "pdf",
      enabled: Boolean(file),
    });
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

  const handlePdfUpload = useCallback((incoming) => {
    const pdf = Array.from(incoming).find((f) => f.type === "application/pdf");
    if (!pdf) {
      setStatusMessage("Only PDF files are accepted.");
      setStatusType("error");
      return;
    }

    resetStatus();
    setFile(pdf);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handlePdfUpload(e.dataTransfer.files);
    },
    [handlePdfUpload]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setFile(null);
    resetDownloadFilename();
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

  const getPosition = (pageWidth, pageHeight, itemWidth, itemHeight) => {
    const margin = 28;

    switch (position) {
      case "top-left":
        return { x: margin, y: pageHeight - itemHeight - margin };
      case "top-right":
        return { x: pageWidth - itemWidth - margin, y: pageHeight - itemHeight - margin };
      case "center":
        return { x: (pageWidth - itemWidth) / 2, y: (pageHeight - itemHeight) / 2 };
      case "bottom-left":
        return { x: margin, y: margin };
      case "bottom-right":
      default:
        return { x: pageWidth - itemWidth - margin, y: margin };
    }
  };

  const applyWatermark = async () => {
    if (!file) {
      setStatusMessage("Upload a PDF to add watermark.");
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
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let imageEmbed = null;

      if (watermarkType === "image") {
        const imageBytes = await watermarkImage.arrayBuffer();
        if (watermarkImage.type === "image/png") {
          imageEmbed = await pdfDoc.embedPng(imageBytes);
        } else {
          imageEmbed = await pdfDoc.embedJpg(imageBytes);
        }
      }

      const alpha = Math.max(0.05, Math.min(1, opacity / 100));
      const scaleFactor = Math.max(0.1, Math.min(0.9, size / 100));

      pdfDoc.getPages().forEach((page) => {
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        if (watermarkType === "text") {
          const fontSize = Math.max(14, Math.min(96, size));
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = fontSize;
          const { x, y } = getPosition(pageWidth, pageHeight, textWidth, textHeight);

          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.18, 0.24, 0.54),
            opacity: alpha,
          });
        } else if (imageEmbed) {
          const { width: baseWidth, height: baseHeight } = imageEmbed.scale(1);
          const maxWidth = pageWidth * scaleFactor;
          const maxHeight = pageHeight * scaleFactor;
          let drawWidth = baseWidth;
          let drawHeight = baseHeight;
          const ratio = baseWidth / baseHeight;

          if (drawWidth > maxWidth) {
            drawWidth = maxWidth;
            drawHeight = drawWidth / ratio;
          }

          if (drawHeight > maxHeight) {
            drawHeight = maxHeight;
            drawWidth = drawHeight * ratio;
          }

          const { x, y } = getPosition(pageWidth, pageHeight, drawWidth, drawHeight);

          page.drawImage(imageEmbed, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
            opacity: alpha,
          });
        }
      });

      const updatedPdfBytes = await pdfDoc.save();
      const blob = new Blob([updatedPdfBytes], { type: "application/pdf" });
      triggerDownload(blob, resolveFilename("watermarked.pdf"));

      setStatusMessage("PDF watermarked successfully! File downloaded.");
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
        PDF Watermark
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
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handlePdfUpload(e.target.files)}
        />

        <svg className="w-16 h-16 text-[#4361ee] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
          <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
        </svg>

        <p className="text-[#1a1a2e] font-semibold text-lg">
          {isDragging ? "Drop your PDF here" : "Choose a PDF or drag & drop here"}
        </p>
        <p className="text-gray-400 text-sm">Click to browse or drop your PDF</p>
        <span className="mt-2 text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1 font-medium">
          PDF only · Watermark supported
        </span>
      </div>

      {file && (
        <div className="w-full mb-6 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-600">1 file selected</span>
            <button
              onClick={clearFile}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Remove
            </button>
          </div>

          <OutputFilenameInput
            value={downloadFilename}
            onChange={setDownloadFilename}
            placeholder="watermarked.pdf"
          />

          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              1
            </span>
            <svg className="w-4 h-4 text-[#4361ee] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="flex-1 text-sm text-gray-700 text-left truncate" title={file.name}>
              {file.name}
            </span>
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
                onClick={() => {
                  setWatermarkType("text");
                  resetStatus();
                }}
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
                onClick={() => {
                  setWatermarkType("image");
                  resetStatus();
                }}
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
                  <button
                    type="button"
                    onClick={clearWatermarkImage}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
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
                <div className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-3 text-sm text-gray-700">
                  {watermarkImage.name}
                </div>
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
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
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
            <p className="text-xs text-gray-500">Adjust the watermark size relative to page dimensions.</p>
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
        <p className="mt-3 text-xs text-[#4361ee]">Upload a PDF to add watermark.</p>
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

export default PDFWatermark;
