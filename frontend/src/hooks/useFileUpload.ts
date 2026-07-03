import { useState, useRef, useCallback, useEffect } from "react";
import { toastError, toastInfo } from "../utils/toast";

interface UseFileUploadOptions {
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Custom hook for handling file uploads, previews, and drag-and-drop logic.
 */
export const useFileUpload = (
  validateFile: (file: File) => Promise<ValidationResult>,
  options: UseFileUploadOptions = {}
) => {
  const {
    maxSize = 10 * 1024 * 1024,
    maxFiles = 1,
    multiple = false,
  } = options;

  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClear = useCallback((e?: React.MouseEvent) => {
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
  }, [previewUrl]);

  const processFiles = useCallback(
    async (selectedFilesArray: FileList | File[]) => {
      if (!selectedFilesArray || selectedFilesArray.length === 0) return;

      const newFiles = multiple ? Array.from(selectedFilesArray) : [selectedFilesArray[0]];

      if (multiple && files.length + newFiles.length > maxFiles) {
        toastError(`You can only upload up to ${maxFiles} files.`);
        return;
      }

      const validFiles: { file: File; message: string }[] = [];
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
    (selectedFile: File) => processFiles([selectedFile]),
    [processFiles]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.target instanceof HTMLElement && 
          (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

      const clipboardFiles = e.clipboardData?.files;
      if (clipboardFiles && clipboardFiles.length > 0) {
        processFiles(clipboardFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleAreaClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement &&
      e.target.tagName.toLowerCase() !== "label" &&
      !e.target.closest("label") &&
      e.target.tagName.toLowerCase() !== "button" &&
      !e.target.closest("button")
    ) {
      fileInputRef.current?.click();
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
