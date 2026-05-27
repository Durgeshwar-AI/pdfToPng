import React, { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { GripVertical, ChevronUp, ChevronDown, X, ImagePlus, Loader2 } from "lucide-react";

function ImagePdf() {
  // Each item: { id, file, thumbnail, name }
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("info"); // info | success | error

  // Drag state
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  const showStatus = (msg, type = "info", autoClear = true) => {
    setStatusMsg(msg);
    setStatusType(type);
    if (autoClear) setTimeout(() => setStatusMsg(""), 4000);
  };

  // Generate an object URL thumbnail for a File - works instantly for images
  const buildImageItems = useCallback((files) => {
    return files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      thumbnail: URL.createObjectURL(file),
      name: file.name,
    }));
  }, []);

  const handleChange = useCallback(
    (e) => {
      const selected = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (!selected.length) return;
      const newItems = buildImageItems(selected);
      setImages((prev) => [...prev, ...newItems]);
      showStatus(
        `${newItems.length} image${newItems.length !== 1 ? "s" : ""} added. Drag or use arrows to reorder.`,
        "success"
      );
      e.target.value = ""; // allow re-selecting same files
    },
    [buildImageItems]
  );

  const removeImage = (index) => {
    setImages((prev) => {
      // revoke the object URL to free memory
      URL.revokeObjectURL(prev[index].thumbnail);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setImages(updated);
  };

  // Drag handlers
  const handleDragStart = (index, id) => {
    dragIndex.current = index;
    setDraggingId(id);
  };

  const handleDragEnter = (index) => {
    dragOverIndex.current = index;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) {
      setDraggingId(null);
      return;
    }
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setImages(updated);
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingId(null);
  };

  const createPdf = async () => {
    if (!images.length) return;
    setLoading(true);
    showStatus("Building PDF...", "info", false);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const bytes = await item.file.arrayBuffer();
        let image;

        if (item.file.type === "image/png") {
          image = await pdfDoc.embedPng(bytes);
        } else if (
          item.file.type === "image/jpeg" ||
          item.file.type === "image/jpg"
        ) {
          image = await pdfDoc.embedJpg(bytes);
        } else {
          // For unsupported types (webp, gif, bmp) - draw via canvas → jpeg conversion
          const bitmap = await createImageBitmap(item.file);
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          canvas.getContext("2d").drawImage(bitmap, 0, 0);
          const blob = await new Promise((res) =>
            canvas.toBlob(res, "image/jpeg", 0.92)
          );
          const convertedBytes = await blob.arrayBuffer();
          image = await pdfDoc.embedJpg(convertedBytes);
        }

        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);

      showStatus(
        `✓ images.pdf downloaded - ${images.length} page${images.length !== 1 ? "s" : ""}.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showStatus("Failed to create PDF. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    images.forEach((item) => URL.revokeObjectURL(item.thumbnail));
    setImages([]);
    setStatusMsg("");
  };

  const statusColors = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1a1a2e]">Image to PDF</h1>
        <p className="text-[#64748b] mt-1 text-sm">
          Add images, arrange them in any order, then download as a single PDF.
          Supports PNG, JPG, WebP, and more.
        </p>
      </div>

      {/* Upload area */}
      <label className="flex items-center justify-center gap-3 w-full h-28 border-2 border-dashed border-[#4361ee] rounded-2xl cursor-pointer bg-[#f8faff] hover:bg-[#eef2ff] transition-all mb-4 group">
        <ImagePlus
          size={20}
          className="text-[#4361ee] group-hover:scale-110 transition-transform"
        />
        <div>
          <p className="text-[#4361ee] font-semibold text-sm">
            {images.length > 0 ? "+ Add more images" : "Click to add images"}
          </p>
          <p className="text-[#94a3b8] text-xs mt-0.5">
            PNG, JPG, JPEG, WebP - each image becomes one PDF page
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {/* Status message */}
      {statusMsg && (
        <div
          className={`text-sm px-4 py-2.5 rounded-xl border mb-4 font-medium ${statusColors[statusType]}`}
        >
          {statusMsg}
        </div>
      )}

      {/* Image list */}
      {images.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a1a2e]">
              {images.length} image{images.length !== 1 ? "s" : ""} - drag or
              use arrows to set PDF page order
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>

          <ul className="space-y-2 mb-6">
            {images.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index, item.id)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 bg-white border rounded-xl px-3 py-2 shadow-sm transition-all
                  ${
                    draggingId === item.id
                      ? "opacity-40 scale-95 border-[#4361ee]"
                      : "border-[#e2e8f0] hover:border-[#4361ee] cursor-grab active:cursor-grabbing"
                  }`}
              >
                {/* Drag handle */}
                <GripVertical size={16} className="text-[#cbd5e1] shrink-0" />

                {/* Position badge */}
                <span className="text-xs font-bold text-white bg-[#4361ee] rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                {/* Image thumbnail */}
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  draggable={false}
                  className="w-12 h-12 object-cover rounded-lg border border-[#e2e8f0] shrink-0 bg-gray-50"
                />

                {/* Filename + size */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    {(item.file.size / 1024).toFixed(0)} KB ·{" "}
                    {item.file.type.split("/")[1].toUpperCase()}
                  </p>
                </div>

                {/* Up / Down buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                    className="p-1 rounded hover:bg-[#f1f5f9] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronUp size={14} className="text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    title="Move down"
                    className="p-1 rounded hover:bg-[#f1f5f9] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronDown size={14} className="text-[#64748b]" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeImage(index)}
                  title="Remove this image"
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-all shrink-0"
                >
                  <X size={14} className="text-red-400" />
                </button>
              </li>
            ))}
          </ul>

          {/* Create PDF button */}
          <button
            onClick={createPdf}
            disabled={!images.length || loading}
            className="w-full py-3.5 px-6 bg-[#4361ee] hover:bg-[#3451d1] active:bg-[#2a41b8] disabled:bg-[#94a3b8] disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating PDF...
              </span>
            ) : (
              `Create PDF from ${images.length} image${images.length !== 1 ? "s" : ""} → Download`
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default ImagePdf;