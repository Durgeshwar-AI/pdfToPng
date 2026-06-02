import { useCallback, useState } from "react";
import ImageTracer from "imagetracerjs";
import ToolPageTemplate from "../components/ToolPageTemplate";

function ImageToSVG() {
  const [svg, setSvg] = useState("");

  const validateFile = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      };
    }

    return {
      isValid: false,
      message:
        "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)",
    };
  }, []);

  const convertImageToSvg = useCallback(
    async ({ file, setLoading, setStatusMessage, setStatusType }) => {
      if (!file) return;

      setSvg("");
      setLoading(true);
      setStatusType("info");
      setStatusMessage("Generating SVG...");

      const reader = new FileReader();

      reader.onload = () => {
        ImageTracer.imageToSVG(
          reader.result,
          (svgString) => {
            setSvg(svgString);
            setLoading(false);
            setStatusType("success");
            setStatusMessage("SVG generated successfully.");
          },
          {
            ltres: 1,
            qtres: 1,
            pathomit: 8,
            colorsampling: 2,
          },
        );
      };

      reader.onerror = () => {
        setLoading(false);
        setStatusType("error");
        setStatusMessage("Error: Unable to read the selected file.");
      };

      reader.readAsDataURL(file);
    },
    [],
  );

  const handleClear = useCallback(() => {
    setSvg("");
  }, []);

  const downloadSVG = useCallback(() => {
    if (!svg) return;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "converted-image.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svg]);

  return (
    <ToolPageTemplate
      title="Image to SVG Converter"
      description="Convert PNG, JPG, JPEG, GIF, BMP and more into a scalable SVG file directly in your browser."
      accept="image/*"
      validateFile={validateFile}
      onSubmit={convertImageToSvg}
      onClear={handleClear}
      submitButtonText="Convert to SVG"
      loadingButtonText="Generating SVG..."
      onSuccessMessage="SVG generated successfully."
      defaultIcon={
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 16L12 8L16 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 12H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      }
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, GIF, BMP, and more"
      inputId="image-input"
      extraContent={({ file }) =>
        svg ? (
          <div className="w-full mt-10 text-left">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#111827]">
                      SVG Preview
                    </h2>
                    <p className="text-sm text-[#6b7280] mt-1">
                      Review the vector output before downloading.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSVG}
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#16a34a] to-[#4ade80] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,185,129,0.22)] active:translate-y-0.5"
                  >
                    Download SVG
                  </button>
                </div>

                <div className="rounded-3xl border border-[#d1d5db] bg-[#f9fafb] p-6 overflow-hidden">
                  <div
                    className="min-h-[320px] flex items-center justify-center overflow-hidden rounded-3xl bg-white p-4 shadow-inner"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
              <h3 className="text-lg font-semibold text-[#111827] mb-3">
                SVG Markup
              </h3>
              <pre className="max-h-[340px] overflow-auto rounded-2xl bg-[#f3f4f6] p-4 text-sm leading-6 text-[#374151]">
                <code>{svg}</code>
              </pre>
            </div>
          </div>
        ) : file ? (
          <div className="mt-10 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] text-center">
            <p className="text-[#4b5563] text-base">
              Select a file and click "Convert to SVG" to see the preview here.
            </p>
          </div>
        ) : null
      }
    />
  );
}

export default ImageToSVG;
