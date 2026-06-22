import { useState, useRef, useCallback, useEffect } from "react";
import { toastError, toastInfo } from "../utils/toast";

/**
 * Custom hook for handling file uploads, previews, and drag-and-drop logic.
 * @param {Function} validateFile - Callback to validate the selected file. Should return { isValid: boolean, message: string }.
 */
export const useFileUpload = (validateFile) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClear = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setStatusMessage("");
    },
    [previewUrl],
  );

  const processFile = useCallback(
    async (selectedFile) => {
      if (!selectedFile) return;

      // 1. File size limit check (10 MB) — toast instead of inline message
      const MAX_SIZE = 10 * 1024 * 1024;
      if (selectedFile.size > MAX_SIZE) {
        toastError(
          `File "${selectedFile.name}" exceeds the 10 MB size limit. Please choose a smaller file.`,
        );
        return;
      }

      // 2. Async validation (type check, PDF page load, etc.)
      const validation = await validateFile(selectedFile);

      if (validation.isValid) {
        setFile(selectedFile);

        // 3. Image and PDF preview logic
        if (selectedFile.type.startsWith("image/")) {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const url = URL.createObjectURL(selectedFile);
          setPreviewUrl(url);
          // Inline status — shows filename inside the upload area widget
          setStatusMessage(
            validation.message || `File "${selectedFile.name}" selected`,
          );
        } else if (selectedFile.type === "application/pdf") {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const url = URL.createObjectURL(selectedFile);
          setPreviewUrl(url);
          setStatusMessage(
            validation.message || `File "${selectedFile.name}" selected`,
          );
        } else {
          setPreviewUrl(null);
          setStatusMessage(
            validation.message || `File "${selectedFile.name}" selected`,
          );
          // Toast confirmation for non-image/pdf types (docx, etc.)
          toastInfo(validation.message || `File "${selectedFile.name}" ready`);
        }
      } else {
        // Invalid file type — dismissable error toast
        toastError(
          validation.message ||
            "Invalid file type. Please select a supported format.",
        );
      }
    },
    [validateFile, previewUrl],
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [processFile],
  );

  const handleAreaClick = (e) => {
    // Prevent triggering when clicking on the label/X button
    if (
      e.target.tagName.toLowerCase() !== "label" &&
      !e.target.closest("label") &&
      e.target.tagName.toLowerCase() !== "button" &&
      !e.target.closest("button")
    ) {
      fileInputRef.current.click();
    }
  };

  return {
    file,
    setFile,
    loading,
    setLoading,
    isDragging,
    statusMessage,
    setStatusMessage,
    previewUrl,
    setPreviewUrl,
    fileInputRef,
    dropAreaRef,
    handleFileChange,
    handleClear,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleAreaClick,
    processFile,
  };
};
