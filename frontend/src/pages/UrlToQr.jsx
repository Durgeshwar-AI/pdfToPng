import React, { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Link as LinkIcon, Download, QrCode, Upload, Palette, Shapes, Type, Layout } from "lucide-react";

const UrlToQr = () => {
  const [url, setUrl] = useState("");
  const [size, setSize] = useState(300);
  const [error, setError] = useState("");
  const [dotsType, setDotsType] = useState("rounded");
  const [cornersType, setCornersType] = useState("extra-rounded");
  const [dotsColor, setDotsColor] = useState("#4361ee");
  const [dotsColorSecondary, setDotsColorSecondary] = useState("#3b82f6");
  const [isGradient, setIsGradient] = useState(true);
  const [margin, setMargin] = useState(10);
  const [logo, setLogo] = useState(null);
  const [preset, setPreset] = useState("Modern");
  const [downloadExt, setDownloadExt] = useState("png");

  const qrRef = useRef(null);
  const qrCode = useRef(
    new QRCodeStyling({
      width: 300,
      height: 300,
      type: "canvas",
      margin: 10,
      data: "https://example.com",
      dotsOptions: {
        color: "#4361ee",
        type: "rounded",
      },
      backgroundOptions: {
        color: "white",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
      },
    })
  );

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (!qrCode.current) return;

    qrCode.current.update({
      data: url || "https://example.com",
      width: size,
      height: size,
      margin: margin,
      image: logo,
      backgroundOptions: {
        color: "transparent",
      },
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
        gradient: isGradient
          ? {
              type: "linear",
              rotation: 0,
              colorStops: [
                { offset: 0, color: dotsColor },
                { offset: 1, color: dotsColorSecondary },
              ],
            }
          : null,
      },
      cornersSquareOptions: {
        type: cornersType,
        color: dotsColor,
      },
      cornersDotOptions: {
        type: cornersType === "extra-rounded" ? "dot" : cornersType === "square" ? "square" : "dot",
        color: dotsColor,
      },
    });
  }, [url, size, dotsType, cornersType, dotsColor, dotsColorSecondary, isGradient, logo, margin]);

  const presets = {
    Classic: {
      dotsType: "square",
      cornersType: "square",
      dotsColor: "#000000",
      isGradient: false,
    },
    Modern: {
      dotsType: "rounded",
      cornersType: "extra-rounded",
      dotsColor: "#4361ee",
      dotsColorSecondary: "#3b82f6",
      isGradient: true,
    },
    Circle: {
      dotsType: "dots",
      cornersType: "dot",
      dotsColor: "#1a1a2e",
      isGradient: false,
      margin: 20,
    },
    Heart: {
      dotsType: "extra-rounded",
      cornersType: "dot",
      dotsColor: "#ff006e",
      dotsColorSecondary: "#ff5d8f",
      isGradient: true,
    },
    Instagram: {
      dotsType: "rounded",
      cornersType: "extra-rounded",
      dotsColor: "#833ab4",
      dotsColorSecondary: "#fd1d1d",
      isGradient: true,
    },
    Neon: {
      dotsType: "classy",
      cornersType: "extra-rounded",
      dotsColor: "#00f5d4",
      dotsColorSecondary: "#00bbf9",
      isGradient: true,
    },
    Business: {
      dotsType: "classy-rounded",
      cornersType: "square",
      dotsColor: "#2b2d42",
      dotsColorSecondary: "#8d99ae",
      isGradient: true,
    },
  };

  const handlePresetChange = (name) => {
    setPreset(name);
    const p = presets[name];
    setDotsType(p.dotsType);
    setCornersType(p.cornersType);
    setDotsColor(p.dotsColor);
    if (p.dotsColorSecondary) setDotsColorSecondary(p.dotsColorSecondary);
    setIsGradient(p.isGradient);
    setMargin(p.margin !== undefined ? p.margin : 10);
  };

  const validateUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = (ext) => {
    qrCode.current.download({
      name: "qr-code",
      extension: ext || downloadExt,
    });
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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto p-6 md:p-10 text-center flex flex-col items-center bg-linear-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-4 text-[#1a1a2e] text-5xl font-bold tracking-tight">
        URL to QR Code
      </h1>

      <p className="text-gray-600 mb-8 max-w-lg">
        Convert website URLs into QR codes instantly. Generate, preview,
        customize size, and download your QR code as a PNG image.
      </p>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="w-full bg-white border border-[#c7d2fe] rounded-2xl p-6 shadow-sm text-left">
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

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="w-full bg-white border border-[#c7d2fe] rounded-2xl p-6 shadow-sm text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-4">
              <Shapes size={16} />
              Style Presets
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-2">
              {Object.keys(presets).map((name) => (
                <button
                  key={name}
                  onClick={() => handlePresetChange(name)}
                  className={`py-2 px-3 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tight ${
                    preset === name
                      ? "bg-[#4361ee] text-white shadow-md scale-105"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-white border border-[#c7d2fe] rounded-2xl p-6 shadow-sm text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-4">
              <Palette size={16} />
              Appearance
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Dots Style</label>
                <select
                  value={dotsType}
                  onChange={(e) => setDotsType(e.target.value)}
                  className="w-full p-2 border border-[#e2e8f0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#4361ee]/20 focus:outline-none"
                >
                  {["square", "rounded", "dots", "classy", "classy-rounded", "extra-rounded"].map((t) => (
                    <option key={t} value={t}>{t.replace("-", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Corners Style</label>
                <select
                  value={cornersType}
                  onChange={(e) => setCornersType(e.target.value)}
                  className="w-full p-2 border border-[#e2e8f0] rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-[#4361ee]/20 focus:outline-none"
                >
                  {["square", "dot", "extra-rounded"].map((t) => (
                    <option key={t} value={t}>{t.replace("-", " ")}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Color</label>
                <div className="flex items-center gap-3 p-1.5 border border-[#e2e8f0] rounded-lg bg-slate-50">
                  <input
                    type="color"
                    value={dotsColor}
                    onChange={(e) => setDotsColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer overflow-hidden bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium">{dotsColor.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Gradient</label>
                  <input
                    type="checkbox"
                    checked={isGradient}
                    onChange={(e) => setIsGradient(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#4361ee]"
                  />
                </div>
                <div className={`flex items-center gap-3 p-1.5 border border-[#e2e8f0] rounded-lg transition-all ${isGradient ? "bg-slate-50 opacity-100" : "bg-slate-100 opacity-40 pointer-events-none"}`}>
                  <input
                    type="color"
                    value={dotsColorSecondary}
                    onChange={(e) => setDotsColorSecondary(e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer overflow-hidden bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium">{dotsColorSecondary.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Size</label>
                <span className="bg-[#4361ee] text-white text-[10px] px-2 py-0.5 rounded font-bold">{size}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="10"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#4361ee]"
              />
            </div>
          </div>

          <div className="w-full bg-white border border-[#c7d2fe] rounded-2xl p-6 shadow-sm text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1a1a2e] uppercase tracking-wider mb-4">
              <Upload size={16} />
              Center Logo
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center gap-2 w-full p-2.5 border-2 border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:border-[#4361ee] hover:text-[#4361ee] cursor-pointer transition-all bg-slate-50"
                >
                  <Upload size={14} />
                  {logo ? "Change Logo" : "Upload Image"}
                </label>
              </div>
              {logo && (
                <button
                  onClick={() => setLogo(null)}
                  className="text-[10px] bg-red-50 text-red-500 px-3 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors uppercase"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center lg:sticky lg:top-10">
          <div className="w-full bg-white border border-[#c7d2fe] rounded-3xl p-8 shadow-xl flex flex-col items-center">
          <div className="flex items-center gap-2 mb-5 text-[#4361ee] font-semibold">
            <QrCode size={20} />
            QR Code Preview
          </div>

            <div 
              className={`
                p-5 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-700 w-full max-w-[320px] aspect-square flex items-center justify-center
                ${preset === "Circle" ? "rounded-full" : "rounded-[2rem]"}
                ${preset === "Heart" ? "ring-8 ring-pink-50" : ""}
                ${preset === "Neon" ? "shadow-[0_0_40px_rgba(0,245,212,0.4)]" : ""}
              `}
            >
              <div ref={qrRef} className="rounded-inherit overflow-hidden transition-transform duration-500 hover:scale-105 [&_canvas]:max-w-full [&_canvas]:h-auto flex items-center justify-center" />
            </div>

            <div className="mt-10 w-full space-y-4">
              <div className="flex gap-2">
                <div className="relative group">
                  <select
                    value={downloadExt}
                    onChange={(e) => setDownloadExt(e.target.value)}
                    className="appearance-none p-3.5 pr-8 border border-[#e2e8f0] rounded-2xl text-sm font-bold bg-slate-50 focus:outline-none focus:border-[#4361ee] cursor-pointer"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Layout size={14} />
                  </div>
                </div>
                <button
                  onClick={() => handleDownload()}
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-6 rounded-2xl font-bold shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)] hover:-translate-y-1 transition-all duration-300"
                >
                  <Download size={20} />
                  DOWNLOAD {downloadExt.toUpperCase()}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <div className="h-px w-8 bg-slate-200" />
                Live Preview
                <div className="h-px w-8 bg-slate-200" />
              </div>
            </div>

            <div className="mt-6 w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase mb-1.5 tracking-wider">
                <Type size={12} className="text-[#4361ee]" />
                Source Data
              </div>
              <p className="text-xs text-slate-600 font-medium truncate max-w-[250px]">
                {url || "https://example.com"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlToQr;