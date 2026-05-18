import { useCallback, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";

function ImageUpscale() {
  const [scaleFactor, setScaleFactor] = useState(2);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return { isValid: true, message: `Image selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select an image file" };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("scale", scaleFactor);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upscale`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.split('.')[0]}_${scaleFactor}x.png`;
        a.click();
        setStatusMessage("Image upscaled successfully!");
      } else {
        const err = await response.json();
        setStatusMessage(`Error: ${err.error}`);
      }
    } catch (err) {
      setStatusMessage("Failed to upscale image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col items-center bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">AI Image Upscaler</h1>
      <p className="text-gray-500 mb-8">Increase image resolution while maintaining quality.</p>
      
      <form onSubmit={handleSubmit} className="w-full">
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
        />

        {file && (
          <div className="w-full mt-6 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upscale Factor</label>
            <div className="flex gap-4">
              {[2, 3, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScaleFactor(s)}
                  className={`px-4 py-2 rounded-lg border transition-all ${scaleFactor === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
        >
          {loading ? "Upscaling..." : "Upscale Image"}
        </button>
      </form>
    </div>
  );
}

export default ImageUpscale;
