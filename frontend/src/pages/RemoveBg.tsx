import { useCallback, useEffect, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastError, toastSuccess } from "../utils/toast";

const stageLabels: Record<string, string> = {
  queued: "Queued...",
  loading_model: "Loading removed background...",
  removing_background: "Removing background...",
  refining_edges: "Refining edges...",
  finalizing: "Finalizing image...",
  complete: "Done!",
};

function RemoveBg() {
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) {
        window.URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

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
      message: "Error: Please select an image file (PNG, JPG, JPEG, etc.)",
    };
  }, []);

  const handleClear = () => {
    setProgress(0);
    setStageLabel("");
    setResultUrl(null);
  };

  const handleCustomSubmit = async ({ file, addToHistory }) => {
    try {
      if (!file) {
        throw new Error("Please select an image first.");
      }

      setProgress(0);
      setStageLabel(stageLabels.queued);
      setResultUrl(null);

      const blob = await removeBackground(file, {
        progress: (_key, current, total) => {
          setStageLabel(stageLabels.loading_model);
          setProgress(total > 0 ? Math.round((current / total) * 45) : 0);
        },
      });

      setProgress(100);
      setStageLabel(stageLabels.complete);

      const previewUrl = window.URL.createObjectURL(blob);
      setResultUrl(previewUrl);
      const downloadUrl = window.URL.createObjectURL(blob);
      const downloadName = `${file.name.replace(/\.[^.]+$/, "")}_no_bg.png`;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toastSuccess("Background removed successfully!");

      if (addToHistory) {
        addToHistory(downloadUrl, downloadName);
      } else {
        window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 0);
      }
    } catch (err: unknown) {
      console.error("RemoveBg error:", err);
      toastError(err instanceof Error ? err.message : "Failed to remove background.");
    }
  };

  return (
    <ToolPageTemplate
      title="Remove Background"
      accept="image/*"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClear}
      submitButtonText="Remove Background"
      loadingButtonText="Removing..."
      extraFields={() =>
        progress > 0 && stageLabel && (
          <div className="w-full mt-4 mb-8">
            <div className="text-sm text-[#6b7280] mb-1">{stageLabel}</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4361ee] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )
      }
      extraContent={
        resultUrl ? (
          <section className="w-full mt-8 text-left" aria-labelledby="remove-bg-result-title">
            <h2
              id="remove-bg-result-title"
              className="text-xl font-semibold text-(--color-app-text) mb-4"
            >
              Result preview
            </h2>
            <div className="rounded-xl border border-gray-200 bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)_50%/20px_20px] p-4">
              <img
                src={resultUrl}
                alt="Image with the background removed"
                className="max-h-96 w-full object-contain"
              />
            </div>
          </section>
        ) : null
      }
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 18V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 15L12 12L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Click to browse or drop your image file"
      inputId="file-input"
    />
  );
}

export default RemoveBg;