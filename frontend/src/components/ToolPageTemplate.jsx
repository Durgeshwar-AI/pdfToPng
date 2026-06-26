import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import {
  toastSuccess,
  toastError,
  toastLoading,
  toastDismiss,
  parseApiError,
} from '../utils/toast';

const FileUploadArea = lazy(() => import('./FileUploadArea'));

const ToolPageTemplate = ({
  title,
  description,
  accept = 'image/*',
  validateFile,
  apiEndpoint,
  fileFieldName = 'image',
  modifyFormData,
  onSubmit,
  onClear,
  submitButtonText = 'Submit',
  loadingButtonText = 'Processing...',
  onSuccessMessage,
  onSuccess, // Callback after successful response
  getDownloadFilename,
  extraFields,
  extraContent,
  showSubmitButton = true,
  maxWidthClass = 'max-w-[600px]',
  defaultIcon,
  defaultText,
  supportText,
  inputId = 'file-input',
}) => {
  const [statusType, setStatusType] = useState('info');
  // statusMessage is kept ONLY for inline progress text (e.g. "Rendering page 3/10…")
  // Final success/error/warning messages go through toasts.
  const [inlineProgress, setInlineProgress] = useState('');

  const internalValidate = useCallback(
    async selectedFile => {
      if (validateFile) {
        return await validateFile(selectedFile);
      }
      return { isValid: true, message: `File selected: ${selectedFile.name}` };
    },
    [validateFile]
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

  const handleClearAll = e => {
    handleClear(e);
    setStatusType('info');
    setInlineProgress('');
    if (onClear) {
      onClear();
    }
  };

  const handleSubmit = async e => {
    if (e) e.preventDefault();
    if (!file) {
      toastError('Please select a file first.');
      return;
    }

    setLoading(true);
    setStatusType('info');
    setInlineProgress('');

    const formData = new FormData();
    formData.append(fileFieldName, file);

    if (modifyFormData) {
      modifyFormData(formData);
    }

    let loadingToastId = null;

    try {
      if (onSubmit) {
        // Custom submit handler — pass setStatusMessage for inline progress
        // and toast helpers for final notifications
        await onSubmit({
          file,
          formData,
          // Keep setStatusMessage for inline multi-step progress text
          setStatusMessage: setInlineProgress,
          setLoading,
          setStatusType,
          previewUrl,
        });
        return;
      }

      if (!apiEndpoint) {
        throw new Error('No API endpoint or custom onSubmit handler provided.');
      }

      loadingToastId = toastLoading(`Processing "${file.name}"…`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}${apiEndpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const downloadName = getDownloadFilename ? getDownloadFilename(file.name) : file.name;
        a.download = downloadName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Call onSuccess callback if provided
        let successMsg = onSuccessMessage || 'Success! File downloaded.';
        if (onSuccess) {
          const customMessage = onSuccess(blob, file.name);
          if (customMessage) successMsg = customMessage;
        }

        toastDismiss(loadingToastId);
        toastSuccess(successMsg);
        setStatusType('success');
      } else {
        const errorMsg = await parseApiError(null, response);
        toastDismiss(loadingToastId);
        toastError(`Operation failed: ${errorMsg}`);
        setStatusType('error');
      }
    } catch (error) {
      if (loadingToastId) toastDismiss(loadingToastId);
      const errorMsg = await parseApiError(error);
      toastError(errorMsg);
      setStatusType('error');
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
    <div
      className={`w-full ${maxWidthClass} theme-panel mx-auto flex flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center`}
    >
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-15 after:-translate-x-1/2 after:rounded-sm after:bg-linear-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        {title}
      </h1>
      {description && <p className="theme-muted mb-8">{description}</p>}

      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center">
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

        {extraFields && (typeof extraFields === 'function' ? extraFields(context) : extraFields)}

        {showSubmitButton && (
          <button
            type="submit"
            disabled={!file || loading}
            className="relative mx-auto w-full max-w-75 cursor-pointer overflow-hidden rounded-lg border-none bg-linear-to-r from-[#4361ee] to-[#3b82f6] px-8 py-3.5 text-lg font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:cursor-not-allowed disabled:bg-linear-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="mr-2.5 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.3)] border-t-white"></span>
                {loadingButtonText}
              </>
            ) : (
              submitButtonText
            )}
          </button>
        )}

        {/* Inline progress text — only shown for multi-step operations (e.g. "Rendering page 3/10…") */}
        {inlineProgress && (
          <p className="theme-muted mt-4 animate-pulse text-[0.9rem]">{inlineProgress}</p>
        )}
      </form>

      {extraContent && (typeof extraContent === 'function' ? extraContent(context) : extraContent)}
    </div>
  );
};

export default ToolPageTemplate;
