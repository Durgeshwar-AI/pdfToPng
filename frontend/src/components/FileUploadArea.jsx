import React from 'react';

const FileUploadArea = ({
  file,
  previewUrl,
  isDragging,
  fileInputRef,
  dropAreaRef,
  handleFileChange,
  handleClear,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleAreaClick,
  accept = 'image/*',
  multiple = false,
  files = [],
  inputId = 'file-input',
  defaultIcon,
  defaultText,
  supportText,
  pdfIcon,
}) => {
  return (
    <div
      ref={dropAreaRef}
      className={`mb-8 flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-8 transition-transform duration-300 select-none focus-within:ring-2 focus-within:ring-[var(--color-app-primary)] ${
        isDragging
          ? 'scale-[1.02] border-[var(--color-app-primary)] bg-[var(--color-app-surface-soft)]'
          : 'border-[var(--color-app-border-strong)] bg-[var(--color-app-surface)] hover:-translate-y-1 hover:border-[var(--color-app-primary)] hover:bg-[var(--color-app-surface-soft)] hover:shadow-[0_8px_15px_rgba(67,97,238,0.1)] active:translate-y-0 active:shadow-[0_4px_8px_rgba(67,97,238,0.08)]'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleAreaClick}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        id={inputId}
        ref={fileInputRef}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="theme-muted flex w-full cursor-pointer flex-col items-center text-xl font-medium transition-colors duration-200 hover:text-[var(--color-app-text)]"
      >
        {file ? (
          <div className="group relative flex w-full flex-col items-center">
            <div className="relative">
              {previewUrl ? (
                file && file.type === 'application/pdf' ? (
                  <embed
                    src={previewUrl}
                    type="application/pdf"
                    className="h-96 w-full rounded-lg object-contain shadow-md"
                    style={{ maxHeight: '560px' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-96 w-full rounded-lg object-contain shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ maxHeight: '560px' }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center p-4">
                  {pdfIcon || (
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-red-500"
                    >
                      <path
                        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2V8H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <text
                        x="12"
                        y="17"
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="6"
                        fontWeight="bold"
                        style={{ fontSize: '5px' }}
                      >
                        PDF
                      </text>
                    </svg>
                  )}
                </div>
              )}
              <button
                onClick={handleClear}
                className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors duration-200 hover:scale-[1.02] hover:bg-red-700"
                aria-label="Remove file"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div
              className="mt-4 max-w-full overflow-hidden rounded-lg border-l-[3px] border-[#0ea5e9] bg-[var(--color-app-surface-soft)] px-4 py-2 font-semibold text-ellipsis whitespace-nowrap text-[#0369a1] shadow-[0_2px_5px_rgba(0,0,0,0.05)] dark:border-sky-500 dark:text-sky-300"
              title={files && files.length > 1 ? `${files.length} files selected` : file.name}
            >
              {files && files.length > 1
                ? `${files.length} files selected`
                : file.name.length > 30
                  ? `${file.name.substring(0, 27)}...`
                  : file.name}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-[2.5rem] text-[#4361ee]">{defaultIcon}</div>
            {defaultText}
            <div className="mt-3 text-[0.95rem] text-slate-500 dark:text-slate-400">
              {supportText}
            </div>
          </>
        )}
      </label>
    </div>
  );
};

export default FileUploadArea;
