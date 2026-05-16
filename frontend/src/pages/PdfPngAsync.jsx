import { useCallback, useState, useEffect } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";

function PdfPngAsync() {
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      return { isValid: true, message: `File selected: ${selectedFile.name}` };
    }
    return { isValid: false, message: "Please select a PDF file" };
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
    setTaskId(null);
    setProgress(0);
    setIsFinished(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/convertPngAsync`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setTaskId(data.task_id);
    } catch (err) {
      setStatusMessage("Error starting task");
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (taskId && !isFinished) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/status/${taskId}`);
          const data = await res.json();

          if (data.state === "PROGRESS") {
            setProgress(50);
            setStatusMessage("Processing...");
          } else if (data.state === "SUCCESS") {
            setIsFinished(true);
            setLoading(false);
            setProgress(100);
            clearInterval(interval);
            
            // Download the result
            const result = data.result;
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${result.result}`;
            link.download = result.filename;
            link.click();
            setStatusMessage("Download complete!");
          } else if (data.state === "FAILURE") {
            setStatusMessage("Task failed");
            setLoading(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error(err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [taskId, isFinished]);

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col items-center bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Async PDF to PNG</h1>
      <p className="text-gray-500 mb-8">Best for large files. Processing happens in background.</p>
      
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
          accept=".pdf"
        />

        {loading && (
          <div className="w-full mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{statusMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
        >
          {loading ? "Processing..." : "Start Conversion"}
        </button>
      </form>
    </div>
  );
}

export default PdfPngAsync;
