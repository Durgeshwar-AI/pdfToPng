import { useState, useRef, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { 
  UploadCloud, 
  Trash2, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileArchive, 
  Image as ImageIcon,
  Layers,
  ChevronRight,
  FolderOpen
} from "lucide-react";

function ImageBatch() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("webp");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach((fileObj) => {
        if (fileObj.preview) {
          URL.revokeObjectURL(fileObj.preview);
        }
      });
    };
  }, [files]);

  const addFiles = useCallback((selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      const isImg = file.type.startsWith("image/");
      const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isImg && isUnderLimit;
    });

    if (validFiles.length < selectedFiles.length) {
      setStatus("Some files were skipped. Only images under 10MB are supported.");
      setTimeout(() => setStatus(""), 5000);
    }

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: "pending",
      error: null
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleRemoveFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleClearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setProgress(0);
    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || loading) return;

    setLoading(true);
    setProgress(0);
    setStatus("Initializing batch conversion...");
    
    const zip = new JSZip();
    
    // Set all file statuses to pending
    setFiles(prev => prev.map(f => ({ ...f, status: "pending", error: null })));

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const currentFileObj = files[i];
      
      // Update specific file status to converting
      setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: "converting" } : f));
      setStatus(`Converting (${i + 1}/${files.length}): ${currentFileObj.name}...`);

      const formData = new FormData();
      formData.append("image", currentFileObj.file);
      formData.append("format", format);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/convert`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const cleanName = currentFileObj.name.replace(/\.[^/.]+$/, "");
          const outputName = `${cleanName}.${format}`;
          
          // Add converted file blob to JSZip
          zip.file(outputName, blob);
          successCount++;
          
          setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: "success" } : f));
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error || "Failed to convert";
          failCount++;
          
          setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: "error", error: errMsg } : f));
        }
      } catch (err) {
        failCount++;
        setFiles(prev => prev.map(f => f.id === currentFileObj.id ? { ...f, status: "error", error: err.message } : f));
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    if (successCount > 0) {
      setStatus("Generating ZIP archive in-memory...");
      try {
        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch_converted_${format}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatus(`Finished! Successful: ${successCount}. Failed: ${failCount}. ZIP downloaded.`);
      } catch (zipErr) {
        console.error(zipErr);
        setStatus("Error generating ZIP file on the frontend.");
      }
    } else {
      setStatus("Conversion failed for all selected files. ZIP was not generated.");
    }
    setLoading(false);
  };

  const getStatusIcon = (fileStatus) => {
    switch (fileStatus) {
      case "converting":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500 font-bold" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-dashed" />;
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto p-6 md:p-10 flex flex-col items-center bg-gradient-to-br from-[#f8fafc] to-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
      {/* Title section */}
      <h1 className="mb-2 text-[#0f172a] text-4xl md:text-5xl font-black tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1.5 after:bg-gradient-to-r after:from-indigo-600 after:to-blue-500 after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:rounded-full">
        Batch Image Converter
      </h1>
      <p className="mt-6 mb-8 text-[0.95rem] md:text-base text-slate-500 font-medium text-center max-w-[600px]">
        Recursively process and convert multiple files in parallel directly in your browser. Rest assured, your files never persist on our servers.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* Custom Drag & Drop Box */}
        <div
          ref={fileInputRef}
          onClick={() => fileInputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative group w-full border-3 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/50 scale-[1.01]"
              : "border-slate-200 bg-slate-50/30 hover:border-indigo-500 hover:-translate-y-1 hover:shadow-lg hover:bg-slate-50/80 active:translate-y-0 active:shadow-md"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-all duration-300">
            <UploadCloud className="w-10 h-10 text-indigo-600" />
          </div>

          <span className="text-xl font-bold text-slate-700">Choose images or drag & drop</span>
          <span className="text-sm text-slate-400 mt-2 font-medium">
            Supports PNG, JPG, JPEG, GIF, WEBP, and more (Up to 10MB each)
          </span>
        </div>

        {/* Selected Files Grid */}
        {files.length > 0 && (
          <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                Selected Files ({files.length})
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={loading}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {files.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={fileObj.preview}
                    alt={fileObj.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate" title={fileObj.name}>
                      {fileObj.name}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {(fileObj.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(fileObj.status)}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleRemoveFile(fileObj.id)}
                      className="p-1 hover:bg-slate-200 text-slate-400 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Section */}
        {files.length > 0 && (
          <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Format Selection */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-slate-400" /> Target Format
              </span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {["webp", "jpeg", "png"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    disabled={loading}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all uppercase ${
                      format === fmt
                        ? "bg-white text-indigo-600 shadow-md scale-[1.02]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto md:min-w-[240px] py-4 px-8 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileArchive className="w-5 h-5" />
                  Convert All (ZIP)
                </>
              )}
            </button>
          </div>
        )}

        {/* Progress Bar & Status logs */}
        {loading && (
          <div className="w-full bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-600">Batch Processing</span>
              <span className="text-sm font-black text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status && (
          <div className="w-full flex items-start gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm font-semibold text-indigo-700 animate-in fade-in duration-300">
            <Layers className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{status}</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default ImageBatch;
