import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toastSuccess, toastError } from "../utils/toast";

const MAX_SIZE = 10 * 1024 * 1024;

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const PAGE_SIZES = {
  original: { label: "Original", width: 0, height: 0 },
  a4: { label: "A4", width: 595.28, height: 841.89 },
  letter: { label: "Letter", width: 612, height: 792 },
};

const MARGIN_OPTIONS = [
  { value: 0, label: "None" },
  { value: 18, label: "Small (0.25″)" },
  { value: 36, label: "Medium (0.5″)" },
  { value: 72, label: "Large (1″)" },
];

/**
 * Convert a file to optimised image bytes, applying rotation if needed.
 * Returns { bytes: ArrayBuffer, type: "png" | "jpg", width, height }.
 */
const getOptimizedImageBytes = async (file, rotation = 0) => {
  // Direct passthrough for native formats with no rotation
  if (
    rotation === 0 &&
    (file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg")
  ) {
    const bytes = await file.arrayBuffer();
    // We still need dimensions for page-size fitting
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    return {
      bytes,
      type: file.type === "image/png" ? "png" : "jpg",
      width,
      height,
    };
  }

  // Canvas-based path: handles rotation AND format conversion
  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  const swapped = rotation === 90 || rotation === 270;
  const canvasW = swapped ? srcH : srcW;
  const canvasH = swapped ? srcW : srcH;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas context not available");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(bitmap, -srcW / 2, -srcH / 2);
  bitmap.close();

  // Choose output format: keep PNG when source is PNG, otherwise JPEG
  const isPng = file.type === "image/png";
  const mimeType = isPng ? "image/png" : "image/jpeg";
  const quality = isPng ? undefined : 0.92;

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Failed to convert image"));
      },
      mimeType,
      quality,
    );
  });

  return {
    bytes: await blob.arrayBuffer(),
    type: isPng ? "png" : "jpg",
    width: canvasW,
    height: canvasH,
  };
};

function ImagePdf() {
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [pageSize, setPageSize] = useState("original");
  const [margin, setMargin] = useState(36);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [items]);

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  const addFiles = useCallback((selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const nextItems = [];
    const rejected = [];

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        rejected.push(`${file.name} (not an image)`);
        return;
      }

      if (file.size > MAX_SIZE) {
        rejected.push(`${file.name} (over 10MB)`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      nextItems.push({ id: createId(), file, previewUrl, rotation: 0 });
    });

    if (rejected.length > 0) {
      toastError(`Skipped: ${rejected.join(", ")}`);
    }

    if (nextItems.length > 0) {
      setItems((prev) => [...prev, ...nextItems]);
    }
  }, []);

  const handleFileChange = (event) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      dropAreaRef.current &&
      !dropAreaRef.current.contains(event.relatedTarget)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files || []));
    event.dataTransfer.clearData();
  };

  const handleAreaClick = (event) => {
    if (
      event.target.tagName.toLowerCase() !== "label" &&
      !event.target.closest("label") &&
      event.target.tagName.toLowerCase() !== "button" &&
      !event.target.closest("button")
    ) {
      fileInputRef.current?.click();
    }
  };

  const moveItem = (index, direction) => {
    setItems((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  };

  const rotateItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item,
      ),
    );
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((entry) => entry.id !== id);
    });
  };

  const handleReorderDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) return;
    setItems((prev) => {
      const currentIndex = prev.findIndex((item) => item.id === draggedId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (currentIndex === -1 || targetIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  const clearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
  };

  const createPdf = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      toastError("Please add at least one image.");
      return;
    }

    setLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const ps = PAGE_SIZES[pageSize];

      for (const item of items) {
        const { bytes, type, width: imgW, height: imgH } =
          await getOptimizedImageBytes(item.file, item.rotation);

        let image;
        if (type === "png") {
          image = await pdfDoc.embedPng(bytes);
        } else {
          image = await pdfDoc.embedJpg(bytes);
        }

        if (pageSize === "original") {
          // Page matches image size exactly
          const page = pdfDoc.addPage([imgW, imgH]);
          page.drawImage(image, { x: 0, y: 0, width: imgW, height: imgH });
        } else {
          // Fit image into standard page with margins
          const pageW = ps.width;
          const pageH = ps.height;
          const page = pdfDoc.addPage([pageW, pageH]);

          const availW = pageW - 2 * margin;
          const availH = pageH - 2 * margin;
          const scale = Math.min(availW / imgW, availH / imgH, 1);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const x = (pageW - drawW) / 2;
          const y = (pageH - drawH) / 2;

          page.drawImage(image, { x, y, width: drawW, height: drawH });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "images-to-pdf.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toastSuccess("Your PDF has been created and downloaded!");
    } catch (err) {
      console.error(err);
      toastError("Failed to create PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[760px] mx-auto p-10 text-center flex flex-col justify-center items-center theme-panel rounded-2xl overflow-hidden">
      <h1 className="mb-10 text-[var(--color-app-text)] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-15 after:h-1 after:bg-linear-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image to PDF
      </h1>
      <p className="text-gray-500 mb-8">
        Convert multiple images into a single PDF and arrange them in the exact
        order you want.
      </p>

      <form onSubmit={createPdf} className="w-full flex flex-col items-center">
        <div
          ref={dropAreaRef}
          className={`w-full border-2 border-dashed rounded-2xl p-8 mb-6 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
            isDragging
              ? "border-[#3b82f6] bg-[#ebf5ff] scale-[1.02]"
              : "border-[#c7d2fe] bg-[rgba(239,246,255,0.6)] hover:border-[#4361ee] hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(67,97,238,0.1)] hover:bg-[rgba(229,240,255,0.8)] active:translate-y-0 active:shadow-[0_4px_8px_rgba(67,97,238,0.08)] active:bg-[rgba(219,234,254,0.9)]"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            id="image-pdf-input"
            ref={fileInputRef}
            className="hidden"
          />
          <label
            htmlFor="image-pdf-input"
            className="flex flex-col items-center text-xl text-[#4b5563] cursor-pointer font-medium transition-colors duration-200 hover:text-[#1a1a2e] w-full"
          >
            <div className="text-[2.5rem] text-[#4361ee] mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 16L8.58579 11.4142C9.36683 10.6332 10.6332 10.6332 11.4142 11.4142L16 16M14 14L15.5858 12.4142C16.3668 11.6332 17.6332 11.6332 18.4142 12.4142L20 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 8H14.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4 20 4 19.1046 4 18V6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            Choose images or drag &amp; drop here
            <div className="text-[0.95rem] text-[#6b7280] mt-3">
              Supports PNG, JPG, GIF, WEBP and more. Up to 10MB each.
            </div>
          </label>
        </div>

        {/* ── Settings Panel ── */}
        {items.length > 0 && (
          <div className="w-full mb-6 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {/* Page size */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#334155]">
                  Page size:
                </span>
                <div className="flex rounded-lg border border-[#e2e8f0] overflow-hidden">
                  {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPageSize(key)}
                      className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        pageSize === key
                          ? "bg-[#4361ee] text-white"
                          : "bg-white text-[#475569] hover:bg-[#f1f5f9]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin (only visible for standard pages) */}
              {pageSize !== "original" && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#334155]">
                    Margin:
                  </span>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-sm text-[#475569] focus:border-[#4361ee] focus:outline-none focus:ring-1 focus:ring-[#4361ee]"
                  >
                    {MARGIN_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between text-sm text-[#475569] mb-3">
              <span>
                {items.length} image{items.length > 1 ? "s" : ""} selected
              </span>
              <span>
                Total size: {(totalSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex-1 space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 rounded-xl border bg-white p-3 shadow-sm transition-all ${
                      dragOverId === item.id
                        ? "border-[#4361ee] ring-2 ring-[#c7d2fe]"
                        : "border-[#e2e8f0]"
                    }`}
                    draggable
                    onDragStart={() => setDraggedId(item.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverId(item.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={() => handleReorderDrop(item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e2e8f0] text-xs font-semibold text-[#475569]">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#475569] cursor-grab active:cursor-grabbing flex items-center justify-center"
                        aria-label="Drag to reorder"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="5" cy="4" r="1.5" />
                          <circle cx="11" cy="4" r="1.5" />
                          <circle cx="5" cy="8" r="1.5" />
                          <circle cx="11" cy="8" r="1.5" />
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="11" cy="12" r="1.5" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b] overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-16 w-16 rounded-lg object-cover transition-transform duration-200"
                        style={{
                          transform: `rotate(${item.rotation}deg)`,
                        }}
                      />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p
                        className="truncate font-semibold text-[#1e293b]"
                        title={item.file.name}
                      >
                        {item.file.name}
                      </p>
                      <p className="text-xs text-[#94a3b8]">
                        {(item.file.size / 1024).toFixed(1)} KB
                        {item.rotation !== 0 && (
                          <span className="ml-2 text-[#4361ee]">
                            ↻ {item.rotation}°
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Rotate button */}
                      <button
                        type="button"
                        onClick={() => rotateItem(item.id)}
                        className="h-9 w-9 rounded-full border border-[#e2e8f0] text-[#475569] transition-colors hover:bg-[#eef2ff] hover:text-[#4361ee] hover:border-[#c7d2fe] flex items-center justify-center"
                        aria-label="Rotate 90° clockwise"
                        title="Rotate 90°"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 2v6h-6" />
                          <path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="h-9 w-9 rounded-full border border-[#e2e8f0] text-[#475569] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:text-[#cbd5f5] flex items-center justify-center"
                        aria-label="Move up"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 19V5" />
                          <path d="M5 12l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1}
                        className="h-9 w-9 rounded-full border border-[#e2e8f0] text-[#475569] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:text-[#cbd5f5] flex items-center justify-center"
                        aria-label="Move down"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14" />
                          <path d="M19 12l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="h-9 w-9 rounded-full border border-red-100 text-red-500 transition-colors hover:bg-red-50"
                        aria-label="Remove"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="submit"
            disabled={items.length === 0 || loading}
            className="flex-1 bg-linear-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-linear-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
                Creating...
              </>
            ) : (
              "Convert to PDF"
            )}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={items.length === 0 || loading}
            className="flex-1 border border-[#e2e8f0] text-[#475569] py-3.5 px-8 rounded-lg text-lg font-semibold transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:text-[#cbd5f5]"
          >
            Clear all
          </button>
        </div>

      </form>
    </div>
  );
}

export default ImagePdf;
