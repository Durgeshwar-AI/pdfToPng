import { useState, useRef, useCallback } from 'react';

let pdfjsLib = null;

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function renderPageThumb(pdfDoc, pageNum, width = 120) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const scale = width / viewport.width;
  const scaled = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(scaled.width);
  canvas.height = Math.floor(scaled.height);
  await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport: scaled,
  }).promise;
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.7),
    aspectRatio: scaled.height / scaled.width,
  };
}

const STAGE = { SELECT: 'select', ARRANGE: 'arrange', DONE: 'done' };

export default function MergePdf() {
  const [stage, setStage] = useState(STAGE.SELECT);
  const [rawFiles, setRawFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('info');

  const [pages, setPages] = useState([]);

  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);
  const [draggingPageId, setDraggingPageId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const inputRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState(null);
  const [previewImageData, setPreviewImageData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const showStatus = useCallback((msg, type = 'info', ttl = 5000) => {
    setStatusMsg(msg);
    setStatusType(type);
    if (ttl) setTimeout(() => setStatusMsg(''), ttl);
  }, []);

  const openPreview = async fileIndex => {
    setPreviewFileIndex(fileIndex);
    setPreviewOpen(true);
    setPreviewLoading(true);
    try {
      const file = rawFiles[fileIndex];
      const lib = await getPdfJs();
      const ab = await file.arrayBuffer();
      const pdfDoc = await lib.getDocument({ data: ab }).promise;
      const { dataUrl } = await renderPageThumb(pdfDoc, 1, 400);
      setPreviewImageData(dataUrl);
    } catch (err) {
      console.error('Preview error:', err);
      showStatus(`Failed to load preview: ${err.message}`, 'error');
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewFileIndex(null);
    setPreviewImageData(null);
  };

  const addFiles = useCallback(
    incoming => {
      const pdfs = Array.from(incoming).filter(f => f.type === 'application/pdf');
      if (!pdfs.length) {
        showStatus('Only PDF files are accepted.', 'error');
        return;
      }
      setStatusMsg('');
      setRawFiles(prev => {
        const names = new Set(prev.map(f => f.name));
        return [...prev, ...pdfs.filter(f => !names.has(f.name))];
      });
    },
    [showStatus]
  );

  const onDrop = useCallback(
    e => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );
  const onDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const loadPages = async () => {
    if (rawFiles.length < 2) {
      showStatus('Add at least 2 PDFs.', 'error');
      return;
    }
    setIsLoading(true);
    setLoadingMsg('Loading pdf.js...');
    try {
      const lib = await getPdfJs();
      const allPages = [];
      for (let fi = 0; fi < rawFiles.length; fi++) {
        const file = rawFiles[fi];
        setLoadingMsg(`Reading "${file.name}"... (${fi + 1}/${rawFiles.length})`);
        const ab = await file.arrayBuffer();
        const pdfDoc = await lib.getDocument({ data: ab }).promise;
        for (let pn = 1; pn <= pdfDoc.numPages; pn++) {
          setLoadingMsg(`Rendering "${file.name}" page ${pn}/${pdfDoc.numPages}...`);
          const { dataUrl, aspectRatio } = await renderPageThumb(pdfDoc, pn);
          allPages.push({
            id: `${fi}-${pn}-${Math.random()}`,
            fileIndex: fi,
            fileName: file.name,
            pageNum: pn,
            thumb: dataUrl,
            aspectRatio,
          });
        }
      }
      setPages(allPages);
      setStage(STAGE.ARRANGE);
    } catch (err) {
      console.error(err);
      showStatus(`Failed to load PDFs. ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  const movePage = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    setPages(prev => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handlePageDragStart = (e, index, id) => {
    dragIdx.current = index;
    setDraggingPageId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handlePageDragEnter = (index, id) => {
    dragOverIdx.current = index;
    setDragOverId(id);
  };
  const handlePageDragOver = e => e.preventDefault();
  const handlePageDrop = e => {
    e.preventDefault();
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from === null || to === null || from === to) {
      resetDrag();
      return;
    }
    setPages(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    resetDrag();
  };
  const resetDrag = () => {
    dragIdx.current = null;
    dragOverIdx.current = null;
    setDraggingPageId(null);
    setDragOverId(null);
  };

  const removePage = index => setPages(prev => prev.filter((_, i) => i !== index));

  const handleMerge = async () => {
    if (!pages.length) return;
    setIsLoading(true);
    setLoadingMsg('Building merged PDF...');
    try {
      const { PDFDocument } = await import('pdf-lib');

      const srcDocs = {};
      for (let fi = 0; fi < rawFiles.length; fi++) {
        const ab = await rawFiles[fi].arrayBuffer();
        srcDocs[fi] = await PDFDocument.load(ab);
      }

      const merged = await PDFDocument.create();
      for (const pg of pages) {
        const src = srcDocs[pg.fileIndex];
        const [copied] = await merged.copyPages(src, [pg.pageNum - 1]);
        merged.addPage(copied);
      }

      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStage(STAGE.DONE);
      showStatus(`merged.pdf downloaded - ${pages.length} pages.`, 'success', 0);
    } catch (err) {
      console.error(err);
      showStatus(`Merge failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  const reset = () => {
    setRawFiles([]);
    setPages([]);
    setStage(STAGE.SELECT);
    setStatusMsg('');
  };

  const FILE_COLORS = [
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-orange-100 text-orange-700 border-orange-200',
  ];
  const fileColor = fi => FILE_COLORS[fi % FILE_COLORS.length];

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-linear-to-br from-[#f6f8fa] to-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:from-slate-800 dark:to-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .merge-root { font-family: 'Sora', sans-serif; }
        .thumb-card { transition: box-shadow .15s, transform .15s, opacity .15s; }
        .thumb-card:hover { box-shadow: 0 8px 24px rgba(67,97,238,.18); transform: translateY(-2px); }
        .thumb-card.dragging { opacity: .35; transform: scale(.96); }
        .thumb-card.drag-over { box-shadow: 0 0 0 3px #4361ee; }
        .grip { cursor: grab; } .grip:active { cursor: grabbing; }
        .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fade-in { animation: fadeIn .35s ease both; }
        .spinner { width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="merge-root">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1a1a2e]">Merge PDFs</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            {stage === STAGE.SELECT && 'Upload PDFs, then arrange pages exactly how you want them.'}
            {stage === STAGE.ARRANGE &&
              `${pages.length} pages loaded - drag or use arrows to reorder, then merge.`}
            {stage === STAGE.DONE && 'Your merged PDF is ready!'}
          </p>
        </div>

        {stage === STAGE.SELECT && (
          <div className="fade-in">
            <div
              className={`mb-5 flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-10 transition-all duration-200 ${
                isDragging
                  ? 'border-[#4361ee] bg-blue-50'
                  : 'border-slate-300 bg-slate-50 hover:border-[#4361ee] hover:bg-blue-50'
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={e => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <svg
                className="mb-1 h-14 w-14 text-[#4361ee]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round" />
                <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
              </svg>
              <p className="text-base font-semibold text-[#1a1a2e]">
                {isDragging
                  ? 'Drop your PDFs here'
                  : rawFiles.length
                    ? '+ Add more PDFs'
                    : 'Choose PDF files or drag & drop'}
              </p>
              <p className="text-xs text-slate-400">PDF only - multiple files supported</p>
            </div>

            {rawFiles.length > 0 && (
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    {rawFiles.length} file{rawFiles.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => setRawFiles([])}
                    className="text-xs font-medium text-red-400 hover:text-red-600"
                  >
                    Clear all
                  </button>
                </div>
                {rawFiles.map((f, i) => (
                  <div
                    key={f.name}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${fileColor(
                      i
                    )}`}
                  >
                    <span className="w-5 text-center font-mono text-xs font-bold">{i + 1}</span>
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="14,2 14,8 20,8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="flex-1 truncate font-medium" title={f.name}>
                      {f.name}
                    </span>
                    <span className="shrink-0 text-xs opacity-60">
                      {(f.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() => openPreview(i)}
                      className="rounded px-2 py-1 text-xs font-medium opacity-50 transition-opacity hover:bg-white/50 hover:opacity-100"
                      title="Preview first page"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => setRawFiles(prev => prev.filter((_, j) => j !== i))}
                      className="px-1 text-xs opacity-50 transition-opacity hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {statusMsg && (
              <p
                className={`mb-4 text-sm font-medium ${
                  statusType === 'error' ? 'text-red-500' : 'text-slate-500'
                }`}
              >
                {statusMsg}
              </p>
            )}

            <button
              onClick={loadPages}
              disabled={rawFiles.length < 2 || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4361ee] py-3.5 text-base font-bold tracking-wide text-white shadow-md transition-all hover:bg-[#3451d1] hover:shadow-lg active:bg-[#2a41b8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  {loadingMsg || 'Loading...'}
                </>
              ) : (
                <>Load Pages & Arrange -&gt;</>
              )}
            </button>
            {rawFiles.length === 1 && (
              <p className="mt-2 text-center text-xs text-[#4361ee]">
                Add at least one more PDF to continue.
              </p>
            )}

            {previewOpen && previewFileIndex !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="animate-in fade-in flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-[#1a1a2e]">
                        {rawFiles[previewFileIndex]?.name || 'PDF Preview'}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">First page preview</p>
                    </div>
                    <button
                      onClick={closePreview}
                      className="text-2xl leading-none font-light text-slate-400 transition-colors hover:text-slate-600"
                      aria-label="Close preview"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-50 p-6">
                    {previewLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="spinner border-blue-300 border-t-[#4361ee]" />
                        <p className="text-sm text-slate-500">Loading preview...</p>
                      </div>
                    ) : previewImageData ? (
                      <img
                        src={previewImageData}
                        alt="PDF First Page Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <p className="text-slate-400">Failed to load preview</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                    <p className="text-xs text-slate-500">
                      {rawFiles[previewFileIndex]?.size
                        ? `${(rawFiles[previewFileIndex].size / 1024).toFixed(0)} KB`
                        : ''}
                    </p>
                    <button
                      onClick={closePreview}
                      className="rounded-lg bg-[#4361ee] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3451d1]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === STAGE.ARRANGE && (
          <div className="fade-in">
            <div className="mb-4 flex flex-wrap gap-2">
              {rawFiles.map((f, i) => (
                <span
                  key={f.name}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${fileColor(i)}`}
                >
                  {f.name.length > 22 ? `${f.name.slice(0, 20)}...` : f.name}
                </span>
              ))}
            </div>

            <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Drag pages to reorder, or use ▲▼ arrows. Click ✕ to remove a page.
            </p>

            <div className="page-grid mb-6">
              {pages.map((pg, idx) => (
                <div
                  key={pg.id}
                  draggable
                  onDragStart={e => handlePageDragStart(e, idx, pg.id)}
                  onDragEnter={() => handlePageDragEnter(idx, pg.id)}
                  onDragOver={handlePageDragOver}
                  onDrop={handlePageDrop}
                  onDragEnd={resetDrag}
                  className={`thumb-card relative overflow-hidden rounded-xl border bg-white select-none ${
                    draggingPageId === pg.id ? 'dragging border-[#4361ee]' : 'border-slate-200'
                  } ${dragOverId === pg.id && draggingPageId !== pg.id ? 'drag-over' : ''} `}
                >
                  <div className="grip flex h-6 items-center justify-center border-b border-slate-100 bg-slate-50">
                    <svg className="h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="7" r="1.5" />
                      <circle cx="15" cy="7" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="17" r="1.5" />
                      <circle cx="15" cy="17" r="1.5" />
                    </svg>
                  </div>

                  <div
                    className="relative bg-slate-100 dark:bg-slate-700"
                    style={{ paddingBottom: `${pg.aspectRatio * 100}%` }}
                  >
                    <img
                      src={pg.thumb}
                      alt={`${pg.fileName} p${pg.pageNum}`}
                      className="absolute inset-0 h-full w-full object-contain"
                      draggable={false}
                    />
                    <span className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4361ee] text-[10px] font-bold text-white shadow">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => removePage(idx)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] text-slate-400 shadow transition-colors hover:bg-red-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                    <div className="min-w-0">
                      <p
                        className="truncate text-[10px] leading-none text-slate-400"
                        title={pg.fileName}
                      >
                        {pg.fileName.length > 14 ? `${pg.fileName.slice(0, 12)}...` : pg.fileName}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] font-semibold ${
                          fileColor(pg.fileIndex).split(' ')[1]
                        }`}
                      >
                        p.{pg.pageNum}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-0.5">
                      <button
                        onClick={() => movePage(idx, -1)}
                        disabled={idx === 0}
                        className="flex h-4 w-5 items-center justify-center rounded border border-slate-200 text-[9px] transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => movePage(idx, 1)}
                        disabled={idx === pages.length - 1}
                        className="flex h-4 w-5 items-center justify-center rounded border border-slate-200 text-[9px] transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {statusMsg && (
              <p
                className={`mb-3 text-sm font-medium ${
                  statusType === 'error' ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {statusMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                &larr; Start over
              </button>
              <button
                onClick={handleMerge}
                disabled={!pages.length || isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4361ee] py-3 text-base font-bold tracking-wide text-white shadow-md transition-all hover:bg-[#3451d1] hover:shadow-lg active:bg-[#2a41b8] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    {loadingMsg}
                  </>
                ) : (
                  <>Merge {pages.length} pages &rarr; Download PDF</>
                )}
              </button>
            </div>
          </div>
        )}

        {stage === STAGE.DONE && (
          <div className="fade-in flex flex-col items-center gap-4 py-12 text-center">
            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a2e]">merged.pdf downloaded!</h2>
            <p className="text-sm text-slate-500">{statusMsg}</p>
            <button
              onClick={reset}
              className="mt-4 rounded-xl bg-[#4361ee] px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-[#3451d1]"
            >
              Merge more PDFs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
