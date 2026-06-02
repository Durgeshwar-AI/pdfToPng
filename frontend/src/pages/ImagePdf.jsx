import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

const MAX_SIZE = 10 * 1024 * 1024;

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const fileToPngBytes = async (file) => {
  if (file.type === "image/png") {
    return file.arrayBuffer();
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Failed to convert image"));
    }, "image/png");
  });

  return blob.arrayBuffer();
};

function ImagePdf() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
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
      nextItems.push({ id: createId(), file, previewUrl });
    });

    if (rejected.length > 0) {
      setStatusMessage(`Skipped: ${rejected.join(", ")}`);
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 4000);
    }

    if (nextItems.length > 0) {
      setItems((prev) => [...prev, ...nextItems]);
      setStatusMessage(
        `Added ${nextItems.length} image${nextItems.length > 1 ? "s" : ""}.`,
      );
      setStatusType("success");
      setTimeout(() => setStatusMessage(""), 2500);
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
    setStatusMessage("");
    setStatusType("info");
  };

  const createPdf = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      setStatusMessage("Please add at least one image.");
      setStatusType("error");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    setStatusMessage("Creating PDF...");
    setStatusType("info");

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of items) {
        const bytes = await fileToPngBytes(item.file);
        const image = await pdfDoc.embedPng(bytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
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

      setStatusMessage("Success! Your PDF has been created.");
      setStatusType("success");
    } catch (err) {
      console.error(err);
      setStatusMessage("Error: Failed to create PDF. See console for details.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[760px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-linear-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-15 after:h-1 after:bg-linear-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
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
            Choose images or drag & drop here
            <div className="text-[0.95rem] text-[#6b7280] mt-3">
              Supports PNG, JPG, GIF, WEBP and more. Up to 10MB each.
            </div>
          </label>
        </div>

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
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b]">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-16 w-16 rounded-lg object-cover"
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
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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

        {statusMessage && (
          <p
            className={`mt-6 text-[0.95rem] ${
              statusType === "success"
                ? "text-green-600"
                : statusType === "error"
                  ? "text-red-500"
                  : "text-[#4b5563]"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}

export default ImagePdf;
