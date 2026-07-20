import { useEffect, useRef, useState, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// A region is stored in fractions (0-1) of the page's own width/height,
// so it stays correct regardless of render scale or zoom, and the backend
// never needs to know pixel dimensions - just the page index + fractions.
export interface RedactionRegion {
  id: string;
  page: number; // 0-indexed
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface PdfRedactSelectorProps {
  file: File;
  regions: RedactionRegion[];
  onRegionsChange: (regions: RedactionRegion[]) => void;
}

export default function PdfRedactSelector({
  file,
  regions,
  onRegionsChange,
}: PdfRedactSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [draftBox, setDraftBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  // Load the document once per file
  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    (async () => {
      try {
        const pdf = await getDocument({ data: await file.arrayBuffer() })
          .promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(0);
      } catch (err) {
        console.error("Failed to load PDF for redaction preview:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  // Render the current page whenever it changes
  useEffect(() => {
    const pdf = pdfDocRef.current;
    if (!pdf) return;
    let cancelled = false;

    (async () => {
      try {
        const page = await pdf.getPage(currentPage + 1);
        const viewport = page.getViewport({ scale: 1.1 });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport, canvas }).promise;
        if (cancelled) return;
        setCanvasSize({ width: viewport.width, height: viewport.height });
      } catch (err) {
        console.error("Failed to render page:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage, numPages]);

  const getRelativePos = useCallback(
    (e: React.MouseEvent) => {
      const overlay = overlayRef.current;
      if (!overlay) return { x: 0, y: 0 };
      const rect = overlay.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
      return { x, y };
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    setDrawStart(pos);
    setDraftBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawStart) return;
    const pos = getRelativePos(e);
    setDraftBox({
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      w: Math.abs(pos.x - drawStart.x),
      h: Math.abs(pos.y - drawStart.y),
    });
  };

  const handleMouseUp = () => {
    if (draftBox && draftBox.w > 4 && draftBox.h > 4 && overlayRef.current) {
      const overlay = overlayRef.current;
      const newRegion: RedactionRegion = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        page: currentPage,
        x0: draftBox.x / overlay.clientWidth,
        y0: draftBox.y / overlay.clientHeight,
        x1: (draftBox.x + draftBox.w) / overlay.clientWidth,
        y1: (draftBox.y + draftBox.h) / overlay.clientHeight,
      };
      onRegionsChange([...regions, newRegion]);
    }
    setDrawStart(null);
    setDraftBox(null);
  };

  const removeRegion = (id: string) => {
    onRegionsChange(regions.filter((r) => r.id !== id));
  };

  const clearPage = () => {
    onRegionsChange(regions.filter((r) => r.page !== currentPage));
  };

  const clearAll = () => {
    onRegionsChange([]);
  };

  const pageRegions = regions.filter((r) => r.page === currentPage);
  const totalCount = regions.length;

  if (!file) return null;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 mt-6 text-left">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Select areas to redact</h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={clearPage}
            disabled={pageRegions.length === 0}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Clear this page
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={totalCount === 0}
            className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-50"
          >
            Clear all ({totalCount})
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Click and drag over the text or areas you want permanently removed.
        This deletes the underlying content — it isn't just a black box drawn
        on top.
      </p>

      <div className="flex justify-center">
        <div
          className="relative select-none"
          style={{
            width: canvasSize.width || undefined,
            height: canvasSize.height || undefined,
          }}
        >
          <canvas
            ref={canvasRef}
            className="border rounded shadow-sm block max-w-full h-auto"
          />

          <div
            ref={overlayRef}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (drawStart) handleMouseUp();
            }}
          >
            {pageRegions.map((r) => (
              <div
                key={r.id}
                className="absolute bg-black/80 border border-red-500 group"
                style={{
                  left: `${r.x0 * 100}%`,
                  top: `${r.y0 * 100}%`,
                  width: `${(r.x1 - r.x0) * 100}%`,
                  height: `${(r.y1 - r.y0) * 100}%`,
                }}
              >
                <button
                  type="button"
                  onClick={() => removeRegion(r.id)}
                  aria-label="Remove this redaction box"
                  className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}

            {draftBox && (
              <div
                className="absolute bg-black/50 border border-dashed border-red-500 pointer-events-none"
                style={{
                  left: draftBox.x,
                  top: draftBox.y,
                  width: draftBox.w,
                  height: draftBox.h,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {numPages}
            {pageRegions.length > 0 &&
              ` · ${pageRegions.length} box${pageRegions.length > 1 ? "es" : ""}`}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((p) => Math.min(numPages - 1, p + 1))
            }
            disabled={currentPage >= numPages - 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
