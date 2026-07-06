import { useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfWatermarkPreview({
  file,
  watermarkType,
  watermarkText,
  watermarkImage,
  position,
  opacity,
  size,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    const renderPdf = async () => {
      try {
        const pdf = await getDocument({
          data: await file.arrayBuffer(),
        }).promise;

        const page = await pdf.getPage(1);

        const viewport = page.getViewport({
          scale: 0.75, // Smaller so it fits nicely
        });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
	  canvas: canvas,
        }).promise;
      } catch (err) {
        console.error(err);
      }
    };

    renderPdf();
  }, [file]);

  const style: React.CSSProperties = {
    position: "absolute",
    zIndex: 10,
    opacity: opacity / 100,
    fontSize: `${size}px`,
    fontWeight: "700",
    color: "#2563eb",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  };

  switch (position) {
    case "top-left":
      style.top = "20px";
      style.left = "20px";
      break;

    case "top-right":
      style.top = "20px";
      style.right = "20px";
      break;

    case "center":
      style.top = "50%";
      style.left = "50%";
      style.transform = "translate(-50%, -50%)";
      break;

    case "diagonal-center":
      style.top = "50%";
      style.left = "50%";
      style.transform = "translate(-50%, -50%) rotate(-45deg)";
      break;

    case "bottom-left":
      style.bottom = "20px";
      style.left = "20px";
      break;

    case "bottom-right":
    default:
      style.bottom = "20px";
      style.right = "20px";
      break;
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 mt-6">

      <h2 className="text-lg font-semibold text-center mb-4">
        Live Preview
      </h2>

      <div className="flex justify-center">

        <div
          className="relative max-w-full"
          style={{ display: "inline-block" }}
        >

          <canvas
            ref={canvasRef}
            className="border rounded shadow-sm block max-w-full h-auto"
          />

          {watermarkType === "text" ? (
            <div style={style}>
              {watermarkText}
            </div>
          ) : (
            watermarkImage && (
              <img
                src={URL.createObjectURL(watermarkImage)}
                alt="Watermark Preview"
                style={{
                  ...style,
                  width: `${(size / 100) * canvasRef.current?.width || 800}px`,
                  height: "auto",
                } as React.CSSProperties}
              />
            )
          )}

        </div>

      </div>

    </div>
  );
}
