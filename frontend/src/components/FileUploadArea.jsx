import React from "react";

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
  accept = "image/*",
  inputId = "file-input",
  defaultIcon,
  defaultText,
  supportText,
  pdfIcon
}) => {
  return (
    <div
      ref={dropAreaRef}
      className={`w-full border-2 border-dashed rounded-2xl p-8 mb-8 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
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
        accept={accept}
        onChange={handleFileChange}
        id={inputId}
        ref={fileInputRef}
        className="hidden"
      />
      <label
        htmlFor={inputId}
        className="flex flex-col items-center text-xl text-[#4b5563] cursor-pointer font-medium transition-colors duration-200 hover:text-[#1a1a2e] w-full"
      >
        {file ? (
          <div className="relative group w-full flex flex-col items-center">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 max-w-full rounded-lg shadow-md object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
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
                        style={{ fontSize: "5px" }}
                      >
                        PDF
                      </text>
                    </svg>
                  )}
                </div>
              )}
              <button
                onClick={handleClear}
                className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all duration-200 hover:scale-110 z-10"
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
              className="bg-[#f0f9ff] px-4 py-2 rounded-lg mt-4 text-[#0369a1] font-semibold shadow-[0_2px_5px_rgba(0,0,0,0.05)] border-l-[3px] border-[#0ea5e9] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              title={file.name}
            >
              {file.name.length > 30
                ? `${file.name.substring(0, 27)}...`
                : file.name}
            </div>
          </div>
        ) : (
          <>
            <div className="text-[2.5rem] text-[#4361ee] mb-4">
              {defaultIcon}
            </div>
            {defaultText}
            <div className="text-[0.95rem] text-[#6b7280] mt-3">
              {supportText}
            </div>
          </>
        )}
      </label>
    </div>
  );
};

export default FileUploadArea;
