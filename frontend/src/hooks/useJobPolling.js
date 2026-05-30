import { useState, useEffect, useRef, useCallback } from "react";

const POLL_INTERVAL = 500;

export const useJobPolling = (jobId, { onComplete, onError } = {}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef(null);
  const completedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!jobId) {
      stopPolling();
      return;
    }

    completedRef.current = false;
    setIsPolling(true);

    const poll = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${baseUrl}/api/status/${jobId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch job status");
        }

        const data = await res.json();
        setProgress(data.progress);
        setStatus(data.status);
        setMessage(data.message);

        if (data.status === "completed") {
          stopPolling();
          completedRef.current = true;
          if (onComplete) {
            onComplete(jobId);
          }
        } else if (data.status === "failed" || data.status === "error") {
          stopPolling();
          completedRef.current = true;
          if (onError) {
            onError(data.message || "Processing failed");
          }
        }
      } catch (err) {
        if (!completedRef.current) {
          setStatus("error");
          setMessage(err.message || "Connection error");
          stopPolling();
          if (onError) {
            onError(err.message || "Connection error");
          }
        }
      }
    };

    poll();
    pollingRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      stopPolling();
    };
  }, [jobId, stopPolling, onComplete, onError]);

  const downloadResult = useCallback(async () => {
    if (!jobId) return;
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const a = document.createElement("a");
    a.href = `${baseUrl}/api/download/${jobId}`;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [jobId]);

  return {
    progress,
    status,
    message,
    isPolling,
    stopPolling,
    downloadResult,
  };
};
