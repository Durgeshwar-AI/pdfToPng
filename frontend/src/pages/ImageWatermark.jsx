import { useState, useRef, useCallback } from 'react';
import { toastError, toastSuccess, toastLoading, toastDismiss } from '../utils/toast';

const POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center', label: 'Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'diagonal-center', label: 'Diagonal Center' },
];

function ImageWatermark() {
  const [file, setFile] = useState(null);
  const [, setPreview] = useState(null);

  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkImage, setWatermarkImage] = useState(null);

  const [position, setPosition] = useState('bottom-right');
  const [opacity, setOpacity] = useState(60);
  const [size, setSize] = useState(30);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);
  const imageInputRef = useRef(null);

  const resetStatus = () => {};

  const handleImageUpload = useCallback(incoming => {
    const img = Array.from(incoming).find(f => f.type?.startsWith('image/'));
    if (!img) {
      toastError('Only image files are accepted.');
      return;
    }

    resetStatus();
    setFile(img);

    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(img);
  }, []);

  const onDrop = useCallback(
    e => {
      e.preventDefault();
      setIsDragging(false);
      handleImageUpload(e.dataTransfer.files);
    },
    [handleImageUpload]
  );

  const onDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    resetStatus();
  };

  const clearWatermarkImage = () => {
    setWatermarkImage(null);
    resetStatus();
  };

  const handleWatermarkImageUpload = e => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(imageFile.type)) {
      toastError('Watermark image must be a PNG or JPG file.');
      return;
    }

    resetStatus();
    setWatermarkImage(imageFile);
  };

  const applyWatermark = async () => {
    if (!file) {
      toastError('Please upload an image first.');
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      toastError('Please upload a watermark image to continue.');
      return;
    }

    resetStatus();
    setIsLoading(true);
    const loadingId = toastLoading('Applying watermark…');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('watermark_type', watermarkType);
      formData.append('position', position);
      formData.append('opacity', opacity);
      formData.append('size', size);

      if (watermarkType === 'text') {
        formData.append('watermark_text', watermarkText);
      } else {
        formData.append('watermark_image', watermarkImage);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/add-watermark`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Processing failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toastDismiss(loadingId);
      toastSuccess('Image watermarked and downloaded!');
    } catch (err) {
      toastDismiss(loadingId);
      toastError(`Watermark failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="theme-panel mx-auto flex w-full max-w-[600px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        Image Watermark
      </h1>

      <div
        className={`mb-6 flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-10 transition-all duration-200 ${
          isDragging
            ? 'border-[#4361ee] bg-blue-50'
            : 'border-gray-300 bg-[#fafbfc] hover:border-[#4361ee] hover:bg-blue-50'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleImageUpload(e.target.files)}
        />

        <svg
          className="mb-2 h-16 w-16 text-[#4361ee]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <p className="text-lg font-semibold text-[#1a1a2e]">
          {isDragging ? 'Drop your image here' : 'Choose an image or drag & drop here'}
        </p>
        <p className="text-sm text-gray-400">Click to browse or drop your image</p>
        <span className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          PNG · JPG supported
        </span>
      </div>

      {file && (
        <div className="mb-6 flex w-full flex-col gap-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">1 file selected</span>
            <button
              onClick={clearFile}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-xs font-bold text-white">
              1
            </span>
            <span className="flex-1 truncate text-left text-sm text-gray-700" title={file.name}>
              {file.name}
            </span>
            <span className="flex-shrink-0 text-xs text-gray-400">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      )}

      <div className="mb-6 w-full rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-[0.2em] text-gray-800 uppercase">
              Watermark Type
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setWatermarkType('text');
                  resetStatus();
                }}
                className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                  watermarkType === 'text'
                    ? 'border-[#4361ee] bg-[#eff6ff] text-[#1a1a2e]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#4361ee]'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => {
                  setWatermarkType('image');
                  resetStatus();
                }}
                className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                  watermarkType === 'image'
                    ? 'border-[#4361ee] bg-[#eff6ff] text-[#1a1a2e]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#4361ee]'
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {watermarkType === 'text' ? (
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold">Watermark Text</span>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
                placeholder="Enter watermark text"
              />
            </label>
          ) : (
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-[#1a1a2e] shadow-sm transition-colors hover:border-[#4361ee] hover:text-[#4361ee]"
                >
                  Upload watermark image
                </button>
                {watermarkImage ? (
                  <button
                    type="button"
                    onClick={clearWatermarkImage}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleWatermarkImageUpload}
              />
              {watermarkImage ? (
                <div className="rounded-xl border border-gray-200 bg-[#f8fafc] px-4 py-3 text-sm text-gray-700">
                  {watermarkImage.name}
                </div>
              ) : (
                <p className="text-xs text-gray-500">PNG or JPG logo file for watermark.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold">Position</span>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-[#1a1a2e] transition-all focus:border-[#4361ee] focus:ring-2 focus:ring-[#4361ee]/15 focus:outline-none"
              >
                {POSITION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-gray-700">
              <span className="font-semibold">Opacity</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
                />
                <span className="min-w-[42px] text-sm font-semibold text-gray-700">{opacity}%</span>
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-gray-700">
            <span className="font-semibold">Size</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200"
              />
              <span className="min-w-[42px] text-sm font-semibold text-gray-700">{size}%</span>
            </div>
            <p className="text-xs text-gray-500">
              Adjust the watermark size relative to image dimensions.
            </p>
          </label>
        </div>
      </div>

      <button
        onClick={applyWatermark}
        disabled={!file || isLoading}
        className="mx-auto flex w-full max-w-[300px] cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-8 py-3.5 text-lg font-semibold tracking-wide text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[rgba(255,255,255,0.3)] border-t-white"></span>
            Processing...
          </>
        ) : (
          'Apply Watermark'
        )}
      </button>
    </div>
  );
}

export default ImageWatermark;
