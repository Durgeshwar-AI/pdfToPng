import { useEffect, useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function MultiFileResults({ files }) {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const urls = files.map((f) =>
      f.blob.type.startsWith("image/") ? URL.createObjectURL(f.blob) : null
    );
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files]);

  const handleCopy = async (blob, index) => {
    try {
      await navigator.clipboard.write([
        new window.ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
      setCopiedIndex(null);
      toast.error("Unable to copy image. Please download it instead.");
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!files?.length) return null;

  return (
    <div className="w-full mt-8 text-left animate-in fade-in slide-in-from-top-4 duration-500">
      <h3 className="text-lg font-semibold text-[var(--color-app-text)] mb-4">
        {files.length} file{files.length !== 1 ? "s" : ""} ready
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex flex-col rounded-xl theme-card overflow-hidden shadow-sm"
          >
            <div className="aspect-[3/4] bg-[var(--color-app-surface-muted)] flex items-center justify-center overflow-hidden">
              {previewUrls[index] ? (
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-[#94a3b8] px-2 text-center break-all">
                  {file.name}
                </span>
              )}
            </div>

            <div className="p-2 border-t border-[var(--color-app-border)]">
              <p
                className="text-[11px] font-medium theme-muted truncate mb-2"
                title={file.name}
              >
                {file.name}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadBlob(file.blob, file.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-[var(--color-app-border)] text-xs font-semibold text-[var(--color-app-primary)] hover:bg-[var(--color-app-surface-soft)] transition-colors"
                  title="Download Image"
                >
                  <Download size={14} />
                  Download
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(file.blob, index)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    copiedIndex === index
                      ? "border-green-200 text-green-600 bg-green-50"
                      : "border-[var(--color-app-border)] text-[var(--color-app-primary)] hover:bg-[var(--color-app-surface-soft)]"
                  }`}
                  title="Copy to Clipboard"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
