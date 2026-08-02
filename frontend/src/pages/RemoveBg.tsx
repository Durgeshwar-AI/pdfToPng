import { useCallback, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastError, toastSuccess } from "../utils/toast";

const stageLabels: Record<string, string> = {
  queued: "Queued...",
  loading_model: "Loading AI model...",
  removing_background: "Removing background...",
  refining_edges: "Refining edges...",
  finalizing: "Finalizing image...",
  complete: "Done!",
};

function RemoveBg() {
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState("");

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
  };

  const handleCustomSubmit = async ({ file, setLoading, addToHistory }) => {
    try {
      setProgress(0);
      setStageLabel(stageLabels.queued);

      const form = new FormData();
      form.append("image", file);

      const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const startRes = await fetch(`${apiBaseUrl}/removeBg`, {
        method: "POST",
        body: form,
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start background removal");
      }

      const { job_id } = await startRes.json();

      // Poll for progress until done or errored
      const poll = async () => {
        const statusRes = await fetch(`${apiBaseUrl}/removeBg/status/${job_id}`);
        if (!statusRes.ok) {
          throw new Error("Lost connection while checking job status");
        }
        const statusData = await statusRes.json();

        setProgress(statusData.progress ?? 0);
        setStageLabel(stageLabels[statusData.stage] || statusData.stage);

        if (statusData.status === "done") {
          const resultRes = await fetch(`${apiBaseUrl}/removeBg/result/${job_id}`);
          if (!resultRes.ok) {
            throw new Error("Failed to fetch final image");
          }
          const blob = await resultRes.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const downloadName = `${file.name.split(".")[0]}_no_bg.png`;

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
            window.URL.revokeObjectURL(downloadUrl);
          }

          setLoading(false);
        } else if (statusData.status === "error") {
          toastError(statusData.error || "Processing failed");
          setLoading(false);
        } else {
          setTimeout(poll, 500);
        }
      };

      await poll();
    } catch (err: any) {
      console.error("RemoveBg error:", err);
      toastError(err.message || "Failed to remove background.");
      setLoading(false);
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