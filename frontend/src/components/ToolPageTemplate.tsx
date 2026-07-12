import { useHistory } from "../context/HistoryContext";
import React, { useState, useCallback, lazy, Suspense } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import PrimaryButton from "./UI/PrimaryButton";
import {
  toastSuccess,
  toastError,
  toastLoading,
  toastDismiss,
  parseApiError,
} from "../utils/toast";

const FileUploadArea = lazy(() => import("./FileUploadArea"));

// ==================== INTERFACE ====================
interface ToolPageTemplateProps {
  title: string;
  description?: string;
  accept?: string;
  validateFile?: (file: any) => Promise<{ isValid: boolean; message: string }>;
  apiEndpoint?: string;
  fileFieldName?: string;
  modifyFormData?: (formData: FormData) => void;
  onSubmit?: (data: any) => Promise<void>;
  onClear?: () => void;
  submitButtonText?: string;
  loadingButtonText?: string;
  onSuccessMessage?: string;
  onSuccess?: (blob: Blob, fileName: string) => string | void;
  getDownloadFilename?: (fileName: string) => string;
  extraFields?: React.ReactNode | ((context: any) => React.ReactNode);
  extraContent?: React.ReactNode | ((context: any) => React.ReactNode);
  showSubmitButton?: boolean;
  maxWidthClass?: string;
  defaultIcon?: React.ReactNode;
  defaultText?: string;
  supportText?: string;
  inputId?: string;
}

// ==================== COMPONENT ====================
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
  onSuccess,
  getDownloadFilename,
  extraFields,
  extraContent,
  showSubmitButton = true,
  maxWidthClass = "max-w-[600px]",
  defaultIcon,
  defaultText,
  supportText,
  inputId = "file-input",
}: ToolPageTemplateProps) => {
  const [statusType, setStatusType] = useState("info");
  const [inlineProgress, setInlineProgress] = useState("");

const { addToHistory } = useHistory();
  const internalValidate = useCallback(
    async (selectedFile: any) => {
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

  const handleClearAll = (e?: React.MouseEvent) => {
    handleClear(e);
    setStatusType("info");
    setInlineProgress("");
    if (onClear) onClear();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file) {
      toastError("Please select a file first.");
      return;
    }

    setLoading(true);
    setStatusType("info");
    setInlineProgress("");

    const formData = new FormData();
    formData.append(fileFieldName, file);

    if (modifyFormData) {
      modifyFormData(formData);
    }

    let loadingToastId = null;

    try {
      if (onSubmit) {
        await onSubmit({
          file,
          formData,
          setStatusMessage: setInlineProgress,
          setLoading,
          setStatusType,
          previewUrl,
          addToHistory: (downloadUrl: string, downloadName: string) => {
            addToHistory({
              fileName: file.name,
              conversionType: title,
              downloadUrl,
              downloadName,
            });
          },
        });
        return;
      }

      if (!apiEndpoint) {
        throw new Error("No API endpoint or custom onSubmit handler provided.");
      }

      loadingToastId = toastLoading(`Processing "${file.name}"…`);

      const response = await fetch(
        `( {import.meta.env.VITE_API_URL} ){apiEndpoint}`,
        { method: "POST", body: formData }
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

        const historyUrl = window.URL.createObjectURL(blob);
        addToHistory({
          fileName: file.name,
          conversionType: title,
          downloadUrl: historyUrl,
          downloadName,
        });

        let successMsg = onSuccessMessage || "Success! File downloaded.";
        if (onSuccess) {
          const customMessage = onSuccess(blob, file.name);
          if (customMessage) successMsg = customMessage;
        }

        toastDismiss(loadingToastId);
        toastSuccess(successMsg);
        setStatusType("success");
      } else {
        const errorMsg = await parseApiError(null, response);
        toastDismiss(loadingToastId);
        toastError(`Operation failed: ${errorMsg}`);
        setStatusType("error");
      }
    } catch (error) {
      if (loadingToastId) toastDismiss(loadingToastId);
      const errorMsg = await parseApiError(error);
      toastError(errorMsg);
      setStatusType("error");
    } finally {
      setLoading(false);
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
  };

  return (
    <div className={`w-full ${maxWidthClass} mx-auto p-10 text-center flex flex-col justify-center items-center theme-panel rounded-2xl overflow-hidden`}>
      <h1 className="mb-10 text-[var(--color-app-text)] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-15 after:h-1 after:bg-linear-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        {title}
      </h1>
      {description && <p className="theme-muted mb-8">{description}</p>}

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <Suspense fallback={<div>Loading upload...</div>}>
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
        </Suspense>

        {extraFields && (typeof extraFields === "function" ? extraFields(context) : extraFields)}

        {showSubmitButton && (
          <PrimaryButton type="submit" disabled={!file || loading}>
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
                {loadingButtonText}
              </>
            ) : (
              submitButtonText
            )}
          </PrimaryButton>
        )}

        {inlineProgress && (
          <p className="mt-4 text-[0.9rem] theme-muted animate-pulse">
            {inlineProgress}
          </p>
        )}
      </form>

      {extraContent && (typeof extraContent === "function" ? extraContent(context) : extraContent)}
    </div>
  );
};

export default ToolPageTemplate;
