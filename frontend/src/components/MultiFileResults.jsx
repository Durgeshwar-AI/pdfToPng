import { useEffect, useMemo, useState } from "react";
import { Download, Archive } from "lucide-react";
import {
  buildZipFilename,
  downloadBlob,
  downloadFilesAsZip,
} from "../utils/zipDownload";

/**
 * Reusable panel for tools that produce multiple output blobs.
 * Shows previews, per-file downloads, and optional "Download All (.zip)".
 */
export default function MultiFileResults({
  files,
  sourceFilename,
  zipFilename,
  showPreviews = true,
}) {
  const [zipping, setZipping] = useState(false);

  const resolvedZipName = useMemo(
    () => zipFilename ?? buildZipFilename(sourceFilename, "pages"),
    [zipFilename, sourceFilename],
  );

  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (!showPreviews) {
      setPreviewUrls([]);
      return;
    }
    const urls = files.map((f) =>
      f.blob.type.startsWith("image/") ? URL.createObjectURL(f.blob) : null,
    );
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [files, showPreviews]);

  if (!files?.length) return null;

  const handleZipAll = async () => {
    setZipping(true);
    try {
      await downloadFilesAsZip(files, resolvedZipName);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="w-full mt-8 text-left animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a2e]">
            {files.length} file{files.length !== 1 ? "s" : ""} ready
          </h3>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Download individually or grab everything in one archive.
          </p>
        </div>
        {files.length > 1 && (
          <button
            type="button"
            onClick={handleZipAll}
            disabled={zipping}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:enabled:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
          >
            {zipping ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Packaging…
              </>
            ) : (
              <>
                <Archive size={18} />
                Download All (.zip)
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex flex-col rounded-xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm"
          >
            <div className="aspect-[3/4] bg-[#f8fafc] flex items-center justify-center overflow-hidden">
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
            <div className="p-2 border-t border-[#e2e8f0]">
              <p
                className="text-[11px] font-medium text-[#334155] truncate mb-2"
                title={file.name}
              >
                {file.name}
              </p>
              <button
                type="button"
                onClick={() => downloadBlob(file.blob, file.name)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#4361ee] hover:bg-[#eff6ff] transition-colors"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
