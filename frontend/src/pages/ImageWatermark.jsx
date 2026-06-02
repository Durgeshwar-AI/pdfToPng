import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";

export default function ImageWatermark() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("© Watermark");
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(70);
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor] = useState("#FFFFFF");
  const [scale, setScale] = useState(20);
  const [loading, setLoading] = useState(false);
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const watermarkFileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setWatermarkedImage(null);
    }
  };

  const handleWatermarkImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWatermarkImage(file);
      setError("");
    }
  };

  const applyWatermark = async () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      setError("Please upload a watermark image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("watermark_type", watermarkType);
      formData.append("position", position);
      formData.append("opacity", opacity);

      if (watermarkType === "text") {
        formData.append("watermark_text", watermarkText);
        formData.append("font_size", fontSize);
        formData.append("color", color);
      } else {
        formData.append("watermark_image", watermarkImage);
        formData.append("scale", scale);
      }

      const response = await fetch("http://localhost:5000/add-watermark", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply watermark");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setWatermarkedImage(url);
    } catch (err) {
      console.error("Error:", err);
      setError("Error applying watermark: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadWatermarkedImage = () => {
    if (watermarkedImage) {
      const a = document.createElement("a");
      a.href = watermarkedImage;
      a.download = "watermarked.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const positions = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
    "tiled",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            🎨 Image Watermark Tool
          </h1>
          <p className="text-lg text-slate-600">
            Add text or image watermarks to protect your photos
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              📤 Upload Image
            </h2>
            <div
              className="border-2 border-dashed border-cyan-400 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <div className="text-4xl mb-2">📸</div>
              <p className="text-slate-600 font-medium mb-2">
                Click to upload image
              </p>
              <p className="text-sm text-slate-500">
                PNG, JPG, WebP or any image format
              </p>
            </div>

            {preview && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  Original Image:
                </p>
                <img
                  src={preview}
                  alt="Original"
                  className="w-full h-64 object-contain rounded-lg border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Settings Section */}
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Watermark Type Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Watermark Type
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    value="text"
                    checked={watermarkType === "text"}
                    onChange={(e) => {
                      setWatermarkType(e.target.value);
                      setError("");
                    }}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <span className="text-slate-700 font-medium">
                    📝 Text Watermark
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    value="image"
                    checked={watermarkType === "image"}
                    onChange={(e) => {
                      setWatermarkType(e.target.value);
                      setError("");
                    }}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <span className="text-slate-700 font-medium">
                    🖼️ Image Watermark
                  </span>
                </label>
              </div>
            </div>

            {/* Text Watermark Settings */}
            {watermarkType === "text" && (
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Text Settings
                </h3>

                {/* Watermark Text */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>10px</span>
                    <span>100px</span>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-10 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <span className="font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Image Watermark Settings */}
            {watermarkType === "image" && (
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Watermark Image
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Watermark Image
                  </label>
                  <input
                    type="file"
                    ref={watermarkFileInputRef}
                    onChange={handleWatermarkImageUpload}
                    accept="image/*"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                  />
                  {watermarkImage && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {watermarkImage.name}
                    </p>
                  )}
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Watermark Scale: {scale}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Position Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Position
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                      position === pos
                        ? "bg-cyan-500 text-white shadow-lg scale-105"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    title={pos}
                  >
                    {pos === "tiled" ? "📋" : "●"}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-slate-600 font-medium capitalize">
                {position}
              </p>
            </div>

            {/* Opacity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Opacity
              </h3>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Opacity: {opacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Transparent</span>
                <span>Opaque</span>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={applyWatermark}
            disabled={loading || !image}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span>✨</span>
                Apply Watermark
              </>
            )}
          </button>
        </div>

        {/* Result Section */}
        {watermarkedImage && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              ✅ Result Preview
            </h2>
            <img
              src={watermarkedImage}
              alt="Watermarked"
              className="w-full max-h-96 object-contain rounded-lg border border-slate-200 mb-6"
            />
            <button
              onClick={downloadWatermarkedImage}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
            >
              <span>⬇️</span>
              Download Watermarked Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}