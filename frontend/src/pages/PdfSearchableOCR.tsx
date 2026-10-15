import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createWorker } from "tesseract.js";
import { FileSearch, Wand2 } from "lucide-react";
import ToolPageTemplate from "../components/ToolPageTemplate";
import { toastError, toastSuccess } from "../utils/toast";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const OCR_SCALE = 2;

function PdfSearchableOCR() {
  const [language, setLanguage] = useState("eng");
  const [preprocess, setPreprocess] = useState("balanced");
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const workerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (workerRef.current?.terminate) {
        workerRef.current.terminate();
      }
      workerRef.current = null;
    };
  }, []);

  const validateFile = useCallback(async (selectedFile) => {
    if (selectedFile && (
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf")
    )) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }

    return { isValid: false, message: "Error: Please select a PDF file" };
  }, []);

  const prepareCanvas = async (page) => {
    const viewport = page.getViewport({ scale: OCR_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Your browser could not create a PDF canvas.");

    await page.render({ canvasContext: context, viewport }).promise;

    if (preprocess !== "none") {
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const threshold = preprocess === "strong" ? 180 : 210;
      for (let index = 0; index < image.data.length; index += 4) {
        const gray =
          image.data[index] * 0.299 +
          image.data[index + 1] * 0.587 +
          image.data[index + 2] * 0.114;
        const value = preprocess === "light"
          ? gray
          : gray > threshold ? 255 : 0;
        image.data[index] = value;
        image.data[index + 1] = value;
        image.data[index + 2] = value;
      }
      context.putImageData(image, 0, 0);
    }

    return canvas;
  };

  const handleOcrSubmit = async ({
    file,
    setLoading,
    setStatusMessage,
    addToHistory,
  }) => {
    if (!file) {
      toastError("Please select a PDF first.");
      return;
    }

    setLoading(true);
    setOcrProgress(0);
    setOcrStatus("Loading PDF...");
    setStatusMessage("Preparing browser OCR...");

    try {
      const sourceBytes = await file.arrayBuffer();
      const outputPdf = await PDFDocument.load(sourceBytes);
      const font = await outputPdf.embedFont(StandardFonts.Helvetica);
      const pdf = await pdfjsLib.getDocument({ data: sourceBytes }).promise;
      const worker = await createWorker({
        logger: (message) => {
          if (message.status === "recognizing text") {
            setOcrStatus(`Recognizing page text (${Math.round((message.progress || 0) * 100)}%)...`);
          } else if (message.status) {
            setOcrStatus(message.status);
          }
        },
      });
      workerRef.current = worker;

      await worker.load();
      await worker.loadLanguage(language);
      await worker.initialize(language);

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const canvas = await prepareCanvas(page);
        const result = await worker.recognize(canvas);
        const outputPage = outputPdf.getPage(pageNumber - 1);
        const pageWidth = outputPage.getWidth();
        const pageHeight = outputPage.getHeight();
        const pageScaleX = pageWidth / canvas.width;
        const pageScaleY = pageHeight / canvas.height;

        for (const word of result.data.words || []) {
          const text = word.text?.trim();
          if (!text || !word.bbox) continue;

          const x = word.bbox.x0 * pageScaleX;
          const y = pageHeight - word.bbox.y1 * pageScaleY;
          const fontSize = Math.max(
            4,
            (word.bbox.y1 - word.bbox.y0) * pageScaleY,
          );

          outputPage.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(1, 1, 1),
            opacity: 0,
          });
        }

        setOcrProgress(pageNumber / pdf.numPages);
      }

      await worker.terminate();
      workerRef.current = null;

      const pdfBytes = await outputPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const downloadName = `${file.name.replace(/\.pdf$/i, "")}_searchable.pdf`;

      if (addToHistory) addToHistory(url, downloadName);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setStatusMessage("");
      setOcrStatus("");
      toastSuccess("Searchable PDF created in your browser.");
    } catch (error) {
      if (workerRef.current?.terminate) await workerRef.current.terminate();
      workerRef.current = null;
      setStatusMessage("");
      setOcrStatus("");
      toastError(`OCR failed: ${error instanceof Error ? error.message : "Please try another PDF."}`);
    } finally {
      setLoading(false);
    }
  };

  const extraFields = ({ file, loading }) => {
    if (!file) return null;

    return (
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">OCR Settings</h3>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">OCR Language</label>
        <select
          value={language}
          disabled={loading}
          onChange={(event) => setLanguage(event.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="eng+hin">English + Hindi</option>
        </select>

        <label className="mb-2 block text-sm font-semibold text-slate-700">Preprocessing</label>
        <select
          value={preprocess}
          disabled={loading}
          onChange={(event) => setPreprocess(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="none">None</option>
          <option value="light">Light denoise</option>
          <option value="balanced">Balanced OCR cleanup</option>
          <option value="strong">Strong thresholding</option>
        </select>

        {loading && (
          <div className="mt-4 text-xs text-blue-600">
            <div className="mb-2 flex justify-between">
              <span>{ocrStatus || "Running OCR..."}</span>
              <span>{Math.round(ocrProgress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.round(ocrProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          OCR runs locally in your browser. The original PDF and recognized text are never uploaded.
        </p>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Scanned PDF OCR"
      description="Create a searchable PDF entirely in your browser. Your scanned document never leaves your device."
      accept="application/pdf"
      validateFile={validateFile}
      onSubmit={handleOcrSubmit}
      submitButtonText="Create Searchable PDF"
      loadingButtonText="Running OCR..."
      extraFields={extraFields}
      maxWidthClass="max-w-[760px]"
      defaultIcon={<FileSearch />}
      defaultText="Upload a scanned PDF"
      supportText="Creates a searchable PDF using browser-based OCR."
      inputId="pdf-searchable-ocr-input"
    />
  );
}

export default PdfSearchableOCR;
