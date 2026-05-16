import { useCallback, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import { Sliders, Zap, ShieldCheck, Maximize } from "lucide-react";

function ImageCompress() {
  const [quality, setQuality] = useState(70);

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
      message: "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)",
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
    { name: "Max Compression", quality: 20, icon: <Zap className="w-4 h-4" /> },
    { name: "Web Optimized", quality: 60, icon: <Maximize className="w-4 h-4" /> },
    { name: "High Quality", quality: 90, icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file first");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("quality", quality);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/compress`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Keep original extension if it's JPEG or WebP, otherwise use .jpg
        let extension = file.name.split('.').pop().toLowerCase();
        if (!["jpg", "jpeg", "webp"].includes(extension)) {
          extension = "jpg";
        }
        
        const filename = file.name.replace(
          /\.[^.]+$/,
          `_compressed.${extension}`
        );
        a.download = filename;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatusMessage(`Success! Image compressed with ${quality}% quality.`);
        setTimeout(() => setStatusMessage(""), 5000);
      } else {
        const error = await response.json();
        setStatusMessage(`Error: ${error.error || "Compression failed"}`);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to compress file"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image Compressor
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
          inputId="compress-input"
          defaultIcon={<Sliders className="w-16 h-16" />}
          defaultText="Upload image for compression"
          supportText="Adjust quality and reduce file size"
        />

        {file && (
          <div className="w-full max-w-[500px] mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                Compression Quality: {quality}%
              </label>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                quality < 30 ? "bg-red-100 text-red-600" : 
                quality < 70 ? "bg-yellow-100 text-yellow-600" : 
                "bg-green-100 text-green-600"
              }`}>
                {quality < 30 ? "Low" : quality < 70 ? "Medium" : "High"}
              </span>
            </div>
            
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-6"
            />

            <div className="grid grid-cols-3 gap-3">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setQuality(p.quality)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all border ${
                    quality === p.quality 
                      ? "bg-blue-50 border-blue-200 text-blue-600" 
                      : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {p.icon}
                  {p.name}
                </button>
              ))}
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
              Compressing...
            </>
          ) : (
            "Compress Image"
          )}
        </button>
        
        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>
    </div>
  );
}

export default ImageCompress;
