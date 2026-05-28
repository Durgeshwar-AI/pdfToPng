import React, { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { GripVertical, ChevronUp, ChevronDown, X, FilePlus, Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Renders a single page of a PDF file into a base64 thumbnail string
async function renderPageThumbnail(file, pageNumber, scale = 0.3) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas.toDataURL("image/png");
}

function PdfMerge() {
  // Each item: { id, file, pageNumber, totalPages, thumbnail, sourceName }
  const [pages, setPages] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [merging, setMerging] = useState(false);
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

  // When user picks files, render all pages into thumbnail cards
  const handleFileChange = useCallback(async (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (!selectedFiles.length) return;

    setLoadingFiles(true);
    showStatus(`Loading ${selectedFiles.length} PDF(s)...`, "info", false);

    const newPages = [];
    for (const file of selectedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        for (let p = 1; p <= totalPages; p++) {
          showStatus(`Reading "${file.name}" - page ${p}/${totalPages}...`, "info", false);
          const thumbnail = await renderPageThumbnail(file, p, 0.35);
          newPages.push({
            id: `${file.name}-${p}-${Date.now()}-${Math.random()}`,
            file,
            pageNumber: p,
            totalPages,
            thumbnail,
            sourceName: file.name.replace(/\.pdf$/i, ""),
          });
        }
      } catch (err) {
        console.error(`Failed to load ${file.name}:`, err);
        showStatus(`Error reading "${file.name}" - is it a valid PDF?`, "error");
      }
    }

    setPages((prev) => [...prev, ...newPages]);
    setLoadingFiles(false);
    showStatus(`${newPages.length} page(s) loaded. Drag or use arrows to reorder.`, "success");
    // reset input so same file can be re-added
    e.target.value = "";
  }, []);

  // Remove a single page card
  const removePage = (index) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  // Move a page up or down by one step
  const movePage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const updated = [...pages];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setPages(updated);
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
    e.preventDefault(); // required to allow drop
  };

  const handleDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) {
      setDraggingId(null);
      return;
    }
    const updated = [...pages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPages(updated);
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingId(null);
  };

  // Final merge - assembles pages in current display order
  const handleMerge = async () => {
    if (pages.length < 2) {
      showStatus("Please add at least 2 pages to merge.", "error");
      return;
    }
    setMerging(true);
    showStatus("Merging pages...", "info", false);

    try {
      const mergedPdf = await PDFDocument.create();

      // Group pages by their source File object to avoid re-loading same file multiple times
      const fileCache = new Map();
      for (const pageItem of pages) {
        if (!fileCache.has(pageItem.file)) {
          const arrayBuffer = await pageItem.file.arrayBuffer();
          const loaded = await PDFDocument.load(arrayBuffer);
          fileCache.set(pageItem.file, loaded);
        }
      }

      for (const pageItem of pages) {
        const sourcePdf = fileCache.get(pageItem.file);
        const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [pageItem.pageNumber - 1]);
        mergedPdf.addPage(copiedPage);
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      showStatus(`✓ merged.pdf downloaded - ${pages.length} pages combined.`, "success");
    } catch (err) {
      console.error(err);
      showStatus("Error while merging. Please try again.", "error");
    } finally {
      setMerging(false);
    }
  };

  const clearAll = () => {
    setPages([]);
    setStatusMsg("");
  };

  // Status bar color
  const statusColors = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1a1a2e]">Merge PDFs</h1>
        <p className="text-[#64748b] mt-1 text-sm">
          Add PDFs, arrange individual pages in any order, then download the merged file.
        </p>
      </div>

      {/* Upload area */}
      <label className="flex items-center justify-center gap-3 w-full h-28 border-2 border-dashed border-[#4361ee] rounded-2xl cursor-pointer bg-[#f8faff] hover:bg-[#eef2ff] transition-all mb-4 group">
        {loadingFiles ? (
          <Loader2 size={20} className="text-[#4361ee] animate-spin" />
        ) : (
          <FilePlus size={20} className="text-[#4361ee] group-hover:scale-110 transition-transform" />
        )}
        <div>
          <p className="text-[#4361ee] font-semibold text-sm">
            {loadingFiles ? "Loading pages..." : pages.length > 0 ? "+ Add more PDFs" : "Click to add PDF files"}
          </p>
          <p className="text-[#94a3b8] text-xs mt-0.5">
            Each PDF's pages will appear below for individual reordering
          </p>
        </div>
        <input
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={loadingFiles}
          className="hidden"
        />
      </label>

      {/* Status message */}
      {statusMsg && (
        <div className={`text-sm px-4 py-2.5 rounded-xl border mb-4 font-medium ${statusColors[statusType]}`}>
          {statusMsg}
        </div>
      )}

      {/* Page list */}
      {pages.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a1a2e]">
              {pages.length} page{pages.length !== 1 ? "s" : ""} - drag or use arrows to set final order
            </p>
            <button
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>

          <ul className="space-y-2 mb-6">
            {pages.map((pageItem, index) => (
              <li
                key={pageItem.id}
                draggable
                onDragStart={() => handleDragStart(index, pageItem.id)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 bg-white border rounded-xl px-3 py-2 shadow-sm transition-all
                  ${draggingId === pageItem.id
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

                {/* Page thumbnail */}
                <img
                  src={pageItem.thumbnail}
                  alt={`Page ${pageItem.pageNumber}`}
                  className="w-10 h-14 object-cover rounded border border-[#e2e8f0] shrink-0 bg-gray-50"
                  draggable={false}
                />

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                    {pageItem.sourceName}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    Page {pageItem.pageNumber} of {pageItem.totalPages}
                  </p>
                </div>

                {/* Up / Down */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => movePage(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                    className="p-1 rounded hover:bg-[#f1f5f9] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronUp size={14} className="text-[#64748b]" />
                  </button>
                  <button
                    onClick={() => movePage(index, 1)}
                    disabled={index === pages.length - 1}
                    title="Move down"
                    className="p-1 rounded hover:bg-[#f1f5f9] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronDown size={14} className="text-[#64748b]" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removePage(index)}
                  title="Remove this page"
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-all shrink-0"
                >
                  <X size={14} className="text-red-400" />
                </button>
              </li>
            ))}
          </ul>

          {/* Merge button */}
          <button
            onClick={handleMerge}
            disabled={pages.length < 2 || merging || loadingFiles}
            className="w-full py-3.5 px-6 bg-[#4361ee] hover:bg-[#3451d1] active:bg-[#2a41b8] disabled:bg-[#94a3b8] disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            {merging ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Merging {pages.length} pages...
              </span>
            ) : (
              `Merge ${pages.length} page${pages.length !== 1 ? "s" : ""} → Download PDF`
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default PdfMerge;