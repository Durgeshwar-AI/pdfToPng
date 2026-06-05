import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link as LinkIcon, Download, QrCode } from "lucide-react";

const UrlToQr = () => {
  const [url, setUrl] = useState("");
  const [size, setSize] = useState(250);
  const [error, setError] = useState("");

  const validateUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = () => {
    if (!validateUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }

    const canvas = document.getElementById("qr-code");

    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrl(value);

    if (value === "") {
      setError("");
      return;
    }

    setError(validateUrl(value) ? "" : "Please enter a valid URL.");
  };

  return (
    <div className="w-full max-w-[650px] mx-auto p-10 text-center flex flex-col items-center bg-linear-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-4 text-[#1a1a2e] text-5xl font-bold tracking-tight">
        URL to QR Code
      </h1>

      <p className="text-gray-600 mb-8 max-w-lg">
        Convert website URLs into QR codes instantly. Generate, preview,
        customize size, and download your QR code as a PNG image.
      </p>

      <div className="w-full bg-white border border-[#c7d2fe] rounded-2xl p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-3">
          <LinkIcon size={16} />
          Website URL
        </label>

        <input
          type="url"
          value={url}
          onChange={handleInputChange}
          placeholder="https://example.com"
          className="w-full p-3 border border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4361ee]/10 focus:border-[#4361ee] transition-colors bg-white"
        />

        {error && (
          <p className="text-red-500 text-sm mt-2 text-left">{error}</p>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-[#1a1a2e] uppercase tracking-wider">
              QR Size
            </label>

            <span className="bg-[#4361ee] text-white text-xs px-2 py-1 rounded font-bold">
              {size}px
            </span>
          </div>

          <input
            type="range"
            min="100"
            max="500"
            step="10"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full accent-[#4361ee]"
          />
        </div>
      </div>

      {validateUrl(url) && (
        <div className="mt-8 w-full bg-white border border-[#c7d2fe] rounded-2xl p-8 shadow-sm flex flex-col items-center">
          <div className="flex items-center gap-2 mb-5 text-[#4361ee] font-semibold">
            <QrCode size={20} />
            QR Code Preview
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <QRCodeCanvas
              id="qr-code"
              value={url}
              size={size}
              includeMargin
            />
          </div>

          <button
            onClick={handleDownload}
            className="mt-6 flex items-center gap-2 bg-linear-to-r from-[#4361ee] to-[#3b82f6] text-white py-3 px-6 rounded-lg font-semibold shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <Download size={18} />
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
};

export default UrlToQr;