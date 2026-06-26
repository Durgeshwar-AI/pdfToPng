import { useEffect, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import JSZip from 'jszip';

export default function MultiFileResults({ files }) {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const urls = files.map(f =>
      f.blob.type.startsWith('image/') ? URL.createObjectURL(f.blob) : null
    );
    setPreviewUrls(urls);
    return () => {
      urls.forEach(url => {
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
      console.error('Failed to copy image:', err);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const downloadAllAsZip = async () => {
    const zip = new JSZip();

    files.forEach(file => {
      zip.file(file.name, file.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!files?.length) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-4 mt-8 w-full text-left duration-500">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-app-text)]">
        {files.length} file{files.length !== 1 ? 's' : ''} ready
      </h3>
      <div className="mb-4">
        <button
          type="button"
          onClick={downloadAllAsZip}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-app-border)] px-4 py-2 text-sm font-semibold text-[var(--color-app-primary)] transition-colors hover:bg-[var(--color-app-surface-soft)]"
        >
          <Download size={16} />
          Download All as ZIP
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="theme-card flex flex-col overflow-hidden rounded-xl shadow-sm"
          >
            <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-[var(--color-app-surface-muted)]">
              {previewUrls[index] ? (
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="px-2 text-center text-xs break-all text-[#94a3b8]">
                  {file.name}
                </span>
              )}
            </div>
            <div className="border-t border-[var(--color-app-border)] p-2">
              <p className="theme-muted mb-2 truncate text-[11px] font-medium" title={file.name}>
                {file.name}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadBlob(file.blob, file.name)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-app-border)] px-2 py-1.5 text-xs font-semibold text-[var(--color-app-primary)] transition-colors hover:bg-[var(--color-app-surface-soft)]"
                  title="Download Image"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(file.blob, index)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                    copiedIndex === index
                      ? 'border-green-200 bg-green-50 text-green-600'
                      : 'border-[var(--color-app-border)] text-[var(--color-app-primary)] hover:bg-[var(--color-app-surface-soft)]'
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
