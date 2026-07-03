import { useCallback, useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import { FileText } from "lucide-react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastSuccess, toastError, toastInfo } from "../utils/toast";

function ImageOCR() {
  const [extractedText, setExtractedText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const workerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (workerRef.current && typeof workerRef.current.terminate === "function") {
        workerRef.current.terminate();
      }
      workerRef.current = null;
    };
  }, []);

  const validateFile = useCallback(async (selectedFile: any) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }
    return {
      isValid: false,
      message: "Error: Please select an image file (PNG, JPG, JPEG, WEBP, etc.)",
    };
  }, []);

  const resetText = useCallback(() => {
    setExtractedText("");
    setOcrProgress(0);
    setOcrStatus("");
  }, []);

  const handleOcrSubmit = async ({ file, setLoading, setStatusMessage, addToHistory }) => {
    if (!file) {
      toastError("Please select an image first.");
      return;
    }

    setStatusMessage("Preparing OCR engine…");
    setOcrStatus("Starting OCR engine...");
    setOcrProgress(0);
    setLoading(true);

    const worker = await createWorker({
      logger: (message) => {
        if (message && message.status) {
          if (message.status === "recognizing text") {
            setOcrStatus("Recognizing text...");
            setOcrProgress(message.progress || 0);
          } else if (message.status === "loading tesseract core") {
            setOcrStatus("Loading OCR core...");
          } else if (message.status === "initializing tesseract") {
            setOcrStatus("Initializing OCR engine...");
          } else if (message.status === "loading language traineddata") {
            setOcrStatus("Loading language data...");
          } else if (message.status === "loaded language model") {
            setOcrStatus("Language loaded...");
          }
        }
      },
    });

    workerRef.current = worker;

    try {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const { data } = await worker.recognize(file);
      const text = data?.text?.trim() ?? "";
      setExtractedText(text);
      setStatusMessage("");

      if (text) {
        toastSuccess("Text extracted successfully! Edit, copy, or download the result.");

        // Add to history as a downloadable .txt file
        if (addToHistory) {
          const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const downloadName = `${file.name.replace(/\.[^.]+$/, "") || "ocr-result"}.txt`;
          addToHistory(url, downloadName);
        }
      } else {
        toastInfo("No readable text was found in the image.");
      }
    } catch (error) {
      setExtractedText("");
      setStatusMessage("");
      toastError(`OCR failed: ${error?.message || "Please try another image."}`);
    } finally {
      if (workerRef.current && typeof workerRef.current.terminate === "function") {
        await workerRef.current.terminate();
      }
      workerRef.current = null;
      setLoading(false);
      setOcrStatus("");
      setOcrProgress(1);
    }
  };

  const handleCopyText = async () => {
    if (!extractedText) {
      toastError("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(extractedText);
      toastSuccess("Text copied to clipboard!");
    } catch {
      toastError("Unable to copy text. Use your browser's copy command instead.");
    }
  };

  const handleDownloadText = (file) => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file
      ? `${file.name.replace(/\.[^.]+$/, "") || "ocr-result"}.txt`
      : "ocr-result.txt";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const extraContent = ({ file, loading }) => (
    <div className="w-full text-left mt-8">
      <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-gray-700">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </span>
          <span>Browser-based OCR — your image never leaves your device.</span>
        </div>
        <p className="text-sm text-gray-500">
          Upload a PNG or JPG, then extract editable text on the client. This is a privacy-focused workflow with no server-side OCR.
        </p>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-gray-800">Extracted Text</span>
          {loading && (
            <span className="text-blue-600">{ocrStatus || "Processing..."}</span>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <textarea
          value={extractedText}
          onChange={(event) => setExtractedText(event.target.value)}
          placeholder="OCR output will appear here after processing..."
          disabled={loading}
          className="min-h-[240px] w-full resize-none rounded-3xl border border-gray-200 bg-white p-4 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {(loading || ocrProgress > 0) && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
            <span>OCR Progress</span>
            <span>{Math.round(ocrProgress * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4361ee] to-[#3b82f6] transition-all duration-300"
              style={{ width: `${Math.round(ocrProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:auto-cols-fr sm:grid-flow-col">
        <button
          type="button"
          onClick={() => handleCopyText()}
          disabled={!extractedText || loading}
          className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-[#4361ee] to-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(67,97,238,0.2)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:text-slate-700"
        >
          Copy Text
        </button>
        <button
          type="button"
          onClick={() => handleDownloadText(file)}
          disabled={!extractedText}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
        >
          Download TXT
        </button>
      </div>
    </div>
  );

  return (
    <ToolPageTemplate
      title="Image OCR"
      description="Extract editable text from PNG or JPG images directly in your browser. No uploads, no server-side OCR."
      accept="image/png,image/jpeg"
      validateFile={validateFile}
      onSubmit={handleOcrSubmit}
      onClear={resetText}
      submitButtonText="Extract Text"
      loadingButtonText="Recognizing..."
      showSubmitButton
      maxWidthClass="max-w-[840px]"
      defaultIcon={<FileText />}
      defaultText="Drop your image here or click to select a file"
      supportText="Supports PNG and JPG. OCR runs entirely in your browser."
      inputId="image-ocr-input"
      extraContent={extraContent}
    />
  );
}

export default ImageOCR;