import React, { useState, useCallback } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import { useJobPolling } from "../hooks/useJobPolling";
import FileUploadArea from "./FileUploadArea";
import ProgressBar from "./ProgressBar";

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
  useAsyncProgress = false,
}) => {
  const [statusType, setStatusType] = useState("info");
  const [jobId, setJobId] = useState(null);

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

  const handlePollComplete = useCallback(
    (completedJobId) => {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const a = document.createElement("a");
      a.href = `${baseUrl}/api/download/${completedJobId}`;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setStatusMessage(onSuccessMessage || "Success! File downloaded.");
      setStatusType("success");
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    },
    [onSuccessMessage, setLoading, setStatusMessage],
  );

  const handlePollError = useCallback(
    (errorMsg) => {
      setStatusMessage(`Error: ${errorMsg || "Processing failed"}`);
      setStatusType("error");
      setLoading(false);
      setJobId(null);
      setTimeout(() => setStatusMessage(""), 5000);
    },
    [setLoading, setStatusMessage],
  );

  const { progress, status: pollStatus, message: pollMessage } = useJobPolling(
    jobId,
    { onComplete: handlePollComplete, onError: handlePollError },
  );

  const handleClearAll = (e) => {
    handleClear(e);
    setStatusType("info");
    setJobId(null);
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

    if (onSubmit) {
      setLoading(true);
      setStatusType("info");
      try {
        const formData = new FormData();
        formData.append(fileFieldName, file);
        if (modifyFormData) {
          modifyFormData(formData);
        }
        await onSubmit({
          file,
          formData,
          setStatusMessage,
          setLoading,
          setStatusType,
          previewUrl,
        });
      } catch (err) {
        setStatusMessage(`Error: ${err.message || "Failed to process file"}`);
        setStatusType("error");
        setLoading(false);
        setTimeout(() => setStatusMessage(""), 5000);
      }
      return;
    }

    if (!apiEndpoint) {
      throw new Error("No API endpoint or custom onSubmit handler provided.");
    }

    setLoading(true);
    setStatusType("info");
    setJobId(null);

    const formData = new FormData();
    formData.append(fileFieldName, file);

    if (modifyFormData) {
      modifyFormData(formData);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${apiEndpoint}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (useAsyncProgress) {
        if (response.ok) {
          const data = await response.json();
          if (data.job_id) {
            setJobId(data.job_id);
            setStatusMessage("Processing started...");
            setStatusType("info");
          } else {
            throw new Error("Unexpected response from server");
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatusMessage(
            `Error: ${errorData.error || "Operation failed"}`,
          );
          setStatusType("error");
          setLoading(false);
          setTimeout(() => setStatusMessage(""), 5000);
        }
      } else {
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
          setStatusMessage(
            `Error: ${errorData.error || "Operation failed"}`,
          );
          setStatusType("error");
        }
        setLoading(false);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    } catch (error) {
      setStatusMessage(
        `Error: ${error.message || "Failed to process file"}`,
      );
      setStatusType("error");
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  const showProgressBar = useAsyncProgress && loading && jobId;
  const progressBarStatus =
    pollStatus === "completed"
      ? "success"
      : pollStatus === "failed" || pollStatus === "error"
        ? "error"
        : "processing";

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
  };

  return (
    <div
      className={`w-full ${maxWidthClass} mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden`}
    >
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-15 after:h-1 after:bg-linear-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        {title}
      </h1>
      {description && <p className="text-gray-500 mb-8">{description}</p>}

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
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

        {extraFields &&
          (typeof extraFields === "function"
            ? extraFields(context)
            : extraFields)}

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

        {showProgressBar ? (
          <ProgressBar
            progress={progress}
            statusMessage={pollMessage || "Processing..."}
            statusType={progressBarStatus}
          />
        ) : (
          statusMessage && (
            <p
              className={`mt-6 text-[0.95rem] ${
                statusType === "success"
                  ? "text-green-600"
                  : statusType === "error"
                    ? "text-red-500"
                    : "text-[#4b5563]"
              }`}
            >
              {statusMessage}
            </p>
          )
        )}
      </form>

      {extraContent &&
        (typeof extraContent === "function"
          ? extraContent(context)
          : extraContent)}
    </div>
  );
};

export default ToolPageTemplate;
