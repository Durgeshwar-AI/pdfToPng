import { useCallback, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { Expand, Image as ImageIcon } from "lucide-react";

function ImageResize() {
  const [dimensions, setDimensions] = useState({ width: "1280", height: "720" });

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }

    return {
      isValid: false,
      message: "Error: Please select an image file (PNG, JPG, JPEG, WEBP, etc.)",
    };
  }, []);

  const {
    file,
    loading,
    setLoading,
    isDragging,
    statusMessage,
    setStatusMessage,
    previewUrl,
    fileInputRef,
    dropAreaRef,
    handleFileChange,
    handleClear,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAreaClick,
  } = useFileUpload(validateFile);

  const presets = [
    { name: "Small", width: 640, height: 480 },
    { name: "Medium", width: 1280, height: 720 },
    { name: "Large", width: 1920, height: 1080 },
    { name: "Square", width: 1080, height: 1080 },
  ];

  const areValidDimensions = () => {
    const width = Number.parseInt(dimensions.width, 10);
    const height = Number.parseInt(dimensions.height, 10);

    return Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0;
  };

  const handleDimensionChange = (field, value) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));
  };

  const applyPreset = (width, height) => {
    setDimensions({ width: String(width), height: String(height) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatusMessage("Please select a file first");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    if (!areValidDimensions()) {
      setStatusMessage("Please enter valid positive width and height values");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("width", Number.parseInt(dimensions.width, 10));
    formData.append("height", Number.parseInt(dimensions.height, 10));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/resizeImage`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const extension = file.name.includes(".")
          ? file.name.slice(file.name.lastIndexOf("."))
          : ".png";
        const baseName = file.name.includes(".")
          ? file.name.replace(/\.[^.]+$/, "")
          : file.name;

        a.href = url;
        a.download = `${baseName}_resized${extension}`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatusMessage(
          `Success! Image resized to ${dimensions.width} x ${dimensions.height}.`,
        );
        setTimeout(() => setStatusMessage(""), 5000);
      } else {
        const error = await response.json();
        setStatusMessage(`Error: ${error.error || "Resize failed"}`);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to resize image"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image Resize
      </h1>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file}
          previewUrl={previewUrl}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={handleClear}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept="image/*"
          inputId="resize-input"
          defaultIcon={<Expand className="w-16 h-16" />}
          defaultText="Upload image for resizing"
          supportText="Choose a preset or enter custom dimensions"
        />

        {file && (
          <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Resize Presets
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
              {presets.map((preset) => {
                const isActive =
                  dimensions.width === String(preset.width) &&
                  dimensions.height === String(preset.height);

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset.width, preset.height)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span>{preset.width} x {preset.height}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-left">
                <span className="block text-sm font-semibold text-gray-700 mb-2">
                  Width
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dimensions.width}
                  onChange={(e) => handleDimensionChange("width", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="text-left">
                <span className="block text-sm font-semibold text-gray-700 mb-2">
                  Height
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange("height", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Resizing...
            </>
          ) : (
            "Resize Image"
          )}
        </button>

        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>
    </div>
  );
}

export default ImageResize;
