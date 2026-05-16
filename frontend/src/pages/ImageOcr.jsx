import { useCallback, useState } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";

function ImageOcr() {
  const [extractedText, setExtractedText] = useState("");

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
    setExtractedText("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setExtractedText(data.text);
        setStatusMessage("Text extracted successfully!");
      } else {
        const err = await response.json();
        setStatusMessage(`Error: ${err.error}`);
      }
    } catch (err) {
      setStatusMessage("Failed to extract text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-10 text-center flex flex-col items-center bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Image OCR (Text Extraction)</h1>
      
      <form onSubmit={handleSubmit} className="w-full">
        <FileUploadArea
          file={file}
          previewUrl={previewUrl}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={() => { handleClear(); setExtractedText(""); }}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept="image/*"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
        >
          {loading ? "Extracting..." : "Extract Text"}
        </button>

        {extractedText && (
          <div className="mt-8 w-full text-left">
            <h3 className="font-bold mb-2">Extracted Text:</h3>
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-48 p-4 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>
        )}
      </form>
    </div>
  );
}

export default ImageOcr;
