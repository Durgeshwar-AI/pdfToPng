import { useHistory } from "../context/history-context";
import React, { useState, useCallback, lazy, Suspense } from "react";
import { useFileUpload } from "../hooks/useFileUpload";
import PrimaryButton from "./UI/PrimaryButton";
import {
  toastError,
  toastSuccess,
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
  onSubmit?: (data: any) => Promise<Blob | void>;
  onClear?: () => void;
  submitButtonText?: string;
  loadingButtonText?: string;
  onSuccessMessage?: string;
  onSuccess?: (blob: Blob, fileName: string) => string | void;
  getDownloadFilename?: (fileName: string) => string;
  headerFields?: React.ReactNode | ((context: any) => React.ReactNode);
  extraFields?: React.ReactNode | ((context: any) => React.ReactNode);
  extraContent?: React.ReactNode | ((context: any) => React.ReactNode);
  showSubmitButton?: boolean;
  hideFileUpload?: boolean;
  requireFile?: boolean;
  maxWidthClass?: string;
  defaultIcon?: React.ReactNode;
  defaultText?: string;
  supportText?: string;
  inputId?: string;
  disableSubmit?: boolean;
}

// ==================== COMPONENT ====================
const ToolPageTemplate = ({
  title,
  description,
  accept = "image/*",
  validateFile,
  fileFieldName = "image",
  modifyFormData,
  onSubmit,
  onClear,
  submitButtonText = "Submit",
  loadingButtonText = "Processing...",
  onSuccessMessage,
  onSuccess,
  headerFields,
  extraFields,
  extraContent,
  showSubmitButton = true,
  hideFileUpload = false,
  requireFile = true,
  maxWidthClass = "max-w-[600px]",
  defaultIcon,
  defaultText,
  supportText,
  inputId = "file-input",
  disableSubmit = false,
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
    if (requireFile && !file) {
      toastError("Please select a file first.");
      return;
    }

    setLoading(true);
    setStatusType("info");
    setInlineProgress("");

    const formData = new FormData();
    if (file) formData.append(fileFieldName, file);

    if (modifyFormData) {
      modifyFormData(formData);
    }

    const loadingToastId = toastLoading(`Processing "${file?.name || title}"…`);

    try {
      if (!onSubmit) {
        throw new Error("This tool does not have a browser processing handler.");
      }

      const result = await onSubmit({
        file,
        formData,
        setStatusMessage: setInlineProgress,
        setLoading,
        setStatusType,
        previewUrl,
        addToHistory: (downloadUrl: string, downloadName: string) => {
          // Text-only submissions have no source file, so the generated
          // download name is the most meaningful label for history.
          addToHistory({
            fileName: file ? file.name : downloadName,
            conversionType: title,
            downloadUrl,
            downloadName,
          });
        },
      });
      const callbackMessage =
        result instanceof Blob && onSuccess
          ? onSuccess(result, file?.name || title)
          : undefined;
      const message = callbackMessage || onSuccessMessage;
      if (message) {
        toastSuccess(message);
        setStatusType("success");
      }
    } catch (error) {
      toastError(await parseApiError(error));
      setStatusType("error");
    } finally {
      toastDismiss(loadingToastId);
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
        {headerFields && (typeof headerFields === "function" ? headerFields(context) : headerFields)}

        {!hideFileUpload && (
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
        )}

        {extraFields && (typeof extraFields === "function" ? extraFields(context) : extraFields)}

        {showSubmitButton && (
          <PrimaryButton
            type="submit"
            disabled={(requireFile && !file) || loading || disableSubmit}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"
                ></span>
                {loadingButtonText}
              </>
            ) : (
              submitButtonText
            )}
          </PrimaryButton>
        )}

        {inlineProgress && (
          <p
            className="mt-4 text-[0.9rem] theme-muted animate-pulse"
            role="status"
            aria-live="polite"
          >
            {inlineProgress}
          </p>
        )}
      </form>

      {extraContent && (typeof extraContent === "function" ? extraContent(context) : extraContent)}
    </div>
  );
};

export default ToolPageTemplate;
