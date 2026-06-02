import React, { useEffect, useRef, useState } from "react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { Image,Download,Undo2 } from "lucide-react";

function BlurImage() {
  const canvasRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [blurAmount, setBlurAmount] = useState(15);
  const [brushSize, setBrushSize] = useState(50);
  const [drawing, setDrawing] = useState(false);
  const [isInsideCanvas, setIsInsideCanvas] = useState(false);
  const [history, setHistory] = useState([]);
  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const validateFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      return {
        isValid: false,
        message: "Please upload an image file",
      };
    }

    return {
      isValid: true,
      message: "Image selected",
    };
  };

  const handleCustomSubmit = ({ file }) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageFile(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageFile) return;
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      const maxWidth = 1100;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;

        width = width * ratio;
        height = height * ratio;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      setHistory([canvas.toDataURL()]);
    };
    img.src = imageFile;
  }, [imageFile]);

  const saveState = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    setHistory((prev) => {
      const updated = [...prev, canvas.toDataURL()];
      if (updated.length > 15) {
        updated.shift();
      }
      return updated;
    });
  };

  const handleBlur = (e) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });

    if (!drawing) return;

    const ctx = canvas.getContext("2d");
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const radius = brushSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "blurred-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const updatedHistory = [...history];
    updatedHistory.pop();
    const previousState = updatedHistory[updatedHistory.length - 1];
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;
    setHistory(updatedHistory);
  };

  const handleClearAll = () => {
    setImageFile(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const extraContent = () => (
    <div className="mt-8 flex flex-col items-center">

      {imageFile && (
        <div className="flex flex-wrap gap-4 items-center justify-center bg-transparent text-white border border-slate-700 rounded-2xl px-6 py-4 shadow-2xl mb-6">

          <div className="flex flex-col">
            <span className="text-xs mb-1 text-black">
              Blur- {blurAmount}px
            </span>

            <input
              type="range"
              min="2"
              max="40"
              value={blurAmount}
              onChange={(e) => setBlurAmount(e.target.value)}
              className="w-[140px] accent-[#4361ee]"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs mb-1 text-black">
              Brush- {brushSize}px
            </span>

            <input
              type="range"
              min="10"
              max="200"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
              className="w-[140px] accent-[#4361ee]"
            />
          </div>

          <button
            onClick={handleUndo}
            className="flex flex-row gap-2 bg-transparent hover:bg-cyan-500 hover:text-white hover:-translate-y-1 hover:shadow-lg active:scale-95 px-5 py-2 rounded-2xl font-medium transition-all duration-300 text-black border border-slate-700"
          >
            Undo
            <Undo2 size={18} />
          </button>

          <button
            onClick={downloadImage}
            className="flex flex-row gap-2 bg-transparent hover:bg-cyan-500 hover:text-white hover:-translate-y-1 hover:shadow-lg active:scale-95 px-5 py-2 rounded-2xl font-medium transition-all duration-300 text-black border border-slate-700"
          >
            Download
            <Download size={18} />
          </button>
        </div>
      )}

      {imageFile && (
        <div className="relative">

          <canvas
            ref={canvasRef}
            onMouseDown={() => {
              saveState();
              setDrawing(true);
            }}
            onMouseUp={() => setDrawing(false)}
            onMouseLeave={() => {
              setDrawing(false);
              setIsInsideCanvas(false);
            }}
            onMouseEnter={() => setIsInsideCanvas(true)}
            onMouseMove={handleBlur}
            className="
              border border-slate-300
              rounded-2xl
              shadow-2xl
              bg-white
              max-w-[95vw]
              max-h-[75vh]
              cursor-none
            "
          />

          {isInsideCanvas && (
            <div
              className="pointer-events-none fixed border border-white rounded-full mix-blend-difference z-50"
              style={{
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                left: `${mousePos.x}px`,
                top: `${mousePos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <ToolPageTemplate
      title="Blur Image Tool"
      description="Upload an image and blur selected areas directly in your browser."
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClearAll}
      submitButtonText="Load Image"
      loadingButtonText="Loading..."
      extraContent={extraContent}
      showSubmitButton={true}
      maxWidthClass="max-w-[1200px]"
      defaultIcon={<Image size={64} />}
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, WEBP"
      inputId="image-blur-input"
    />
  );
}

export default BlurImage;