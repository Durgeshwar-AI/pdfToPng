import { useState, useRef, useCallback, useEffect } from "react";
import { toastError, toastInfo } from "../utils/toast";

/**
 * Custom hook for handling file uploads, previews, and drag-and-drop logic.
 * @param {Function} validateFile - Callback to validate the selected file. Should return { isValid: boolean, message: string }.
 * @param {Object} options - Configuration options.
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10 MB).
 * @param {number} options.maxFiles - Maximum number of files allowed (default: 1).
 * @param {boolean} options.multiple - Whether to allow multiple file uploads (default: false).
 */
export const useFileUpload = (validateFile, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024,
    maxFiles = 1,
    multiple = false,
  } = options;

  const [file, setFile] = useState(null); // Keeps first file for backward compatibility
  const [files, setFiles] = useState([]); // Array for multi-file support

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
      setFiles([]);
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

  const processFiles = useCallback(
    async (selectedFilesArray) => {
      if (!selectedFilesArray || selectedFilesArray.length === 0) return;

      const newFiles = multiple ? Array.from(selectedFilesArray) : [selectedFilesArray[0]];

      if (multiple && files.length + newFiles.length > maxFiles) {
        toastError(`You can only upload up to ${maxFiles} files.`);
        return;
      }

      const validFiles = [];
      for (const f of newFiles) {
        if (f.size > maxSize) {
          toastError(`File "${f.name}" exceeds the limit. Please choose a smaller file.`);
          continue;
        }

        const validation = await validateFile(f);
        if (validation.isValid) {
          validFiles.push({ file: f, message: validation.message });
        } else {
          toastError(validation.message || "Invalid file type. Please select a supported format.");
        }
      }

      if (validFiles.length > 0) {
        const firstValid = validFiles[0].file;
        setFile(firstValid);
        setFiles(prev => multiple ? [...prev, ...validFiles.map(v => v.file)] : [firstValid]);

        if (firstValid.type.startsWith("image/") || firstValid.type === "application/pdf") {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(firstValid));
        } else {
          setPreviewUrl(null);
          toastInfo(validFiles[0].message || `File ready`);
        }

        if (multiple && validFiles.length > 1) {
          setStatusMessage(`${validFiles.length} files selected`);
        } else {
          setStatusMessage(validFiles[0].message || `File "${firstValid.name}" selected`);
        }
      }
    },
    [validateFile, previewUrl, multiple, maxSize, maxFiles, files]
  );

  const processFile = useCallback(
    (selectedFile) => processFiles([selectedFile]),
    [processFiles]
  );

  const handleFileChange = (e) => {
    processFiles(e.target.files);
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e) => {
      // Prevent handling paste if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const clipboardFiles = e.clipboardData?.files;
      if (clipboardFiles && clipboardFiles.length > 0) {
        processFiles(clipboardFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFiles]);

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
        processFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [processFiles],
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
    files,
    setFile,
    setFiles,
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
    processFiles,
  };
};
