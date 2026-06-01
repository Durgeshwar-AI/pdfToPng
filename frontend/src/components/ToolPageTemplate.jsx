import React, { useState, useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "./FileUploadArea";

const ToolPageTemplate = ({
  title,
  description,
  accept = "image/*",
  validateFile,
  apiEndpoint,
  fileFieldName = "image",
  modifyFormData,
  onSubmit,
  onClear,
  submitButtonText = "Submit",
  loadingButtonText = "Processing...",
  onSuccessMessage,
  getDownloadFilename,
  extraFields,
  extraContent,
  showSubmitButton = true,
  maxWidthClass = "max-w-[600px]",
  defaultIcon,
  defaultText,
  supportText,
  inputId = "file-input",
}) => {
  const [statusType, setStatusType] = useState("info"); // info, success, error
  const [progress, setProgress] = useState(0);

  const internalValidate = useCallback(
    async (selectedFile) => {
      if (validateFile) {
        return await validateFile(selectedFile);
      }
      return { isValid: true, message: `File selected: ${selectedFile.name}` };
    },
    [validateFile],
  );

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
  } = useFileUpload(internalValidate);

  const handleClearAll = (e) => {
    handleClear(e);
    setStatusType("info");
    setProgress(0);
    if (onClear) {
      onClear();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file first");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    setStatusType("info");

    const formData = new FormData();
    formData.append(fileFieldName, file);

    if (modifyFormData) {
      modifyFormData(formData);
    }

    try {
      if (onSubmit) {
        await onSubmit({
          file,
          formData,
          setStatusMessage,
          setLoading,
          setStatusType,
          previewUrl,
        });
        return;
      }

      if (!apiEndpoint) {
        throw new Error("No API endpoint or custom onSubmit handler provided.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${apiEndpoint}`,
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

        const downloadName = getDownloadFilename
          ? getDownloadFilename(file.name)
          : file.name;
        a.download = downloadName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatusMessage(onSuccessMessage || "Success! File downloaded.");
        setStatusType("success");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage(`Error: ${errorData.error || "Operation failed"}`);
        setStatusType("error");
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to process file"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusMessage("");
      }, 5000);
    }
  };

  const context = {
    file,
    loading,
    setLoading,
    statusMessage,
    setStatusMessage,
    statusType,
    setStatusType,
    handleClear: handleClearAll,
    handleSubmit,
    previewUrl,
    progress,
    setProgress,
  };

  return (
    <div className={`w-full ${maxWidthClass} mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden`}>
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-15 after:h-1 after:bg-linear-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        {title}
      </h1>
      {description && <p className="text-gray-500 mb-8">{description}</p>}

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <FileUploadArea
          file={file}
          previewUrl={previewUrl}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={handleClearAll}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept={accept}
          inputId={inputId}
          defaultIcon={defaultIcon}
          defaultText={defaultText}
          supportText={supportText}
        />

        {extraFields && (typeof extraFields === "function" ? extraFields(context) : extraFields)}

        {showSubmitButton && (
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-linear-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-75 mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-linear-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
                {loadingButtonText}
              </>
            ) : (
              submitButtonText
            )}
          </button>
        )}

        {statusMessage && (
          <p className={`mt-6 text-[0.95rem] ${statusType === "success" ? "text-green-600" : statusType === "error" ? "text-red-500" : "text-[#4b5563]"}`}>
            {statusMessage}
          </p>
        )}

        {progress > 0 && progress < 100 && (
          <div className="mt-6 w-full max-w-xs mx-auto">
            <div className="flex items-center justify-between text-sm text-[#6b7280] mb-1">
              <span>Processing</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4361ee] to-[#3b82f6] transition-all duration-300"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
          </div>
        )}
      </form>

      {extraContent && (typeof extraContent === "function" ? extraContent(context) : extraContent)}
    </div>
  );
};

export default ToolPageTemplate;
