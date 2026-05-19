import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

function ImagePdf() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const createPdf = async () => {
    if (!files.length) return;

    try {
      setLoading(true);

      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();

        let image;
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(bytes);
        } else {
          image = await pdfDoc.embedJpg(bytes);
        }

        const { width, height } = image.scale(1);

        const page = pdfDoc.addPage([width, height]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to create PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 bg-white rounded-2xl shadow-lg text-center">
      <h1 className="text-4xl font-bold mb-8 text-[#1a1a2e]">
        Image to PDF
      </h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="mb-6"
      />

      {files.length > 0 && (
        <div className="mb-6 text-left">
          {files.map((file, index) => (
            <p key={index} className="text-sm text-gray-700">
              {file.name}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={createPdf}
        disabled={!files.length || loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        {loading ? "Creating PDF..." : "Convert to PDF"}
      </button>
    </div>
  );
}

export default ImagePdf;