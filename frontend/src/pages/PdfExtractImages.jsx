import React, { useState } from 'react';
import ToolPageTemplate from '../components/ToolPageTemplate';
import FileUploadArea from '../components/FileUploadArea';
import axios from 'axios';

const PdfExtractImages = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    await loadPreview(selectedFile);
  };

  const loadPreview = async (fileToPreview) => {
    const formData = new FormData();
    formData.append('file', fileToPreview);

    try {
      const response = await axios.post(`${API_URL}/preview-pdf-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setPreviews(response.data.previews);
      } else {
        setError(response.data.error || 'No images to preview');
      }
    } catch (err) {
      setError('Could not load preview. PDF may have no images.');
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/extract-pdf-images`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.name.replace('.pdf', '')}_extracted_images.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      if (err.response && err.response.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const errorJson = JSON.parse(text);
          setError(errorJson.error || 'Extraction failed');
        } catch {
          setError('Extraction failed. Please check the PDF format.');
        }
      } else {
        setError(err.response?.data?.error || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageTemplate
      title="Extract Images from PDF"
      description="Extract all embedded images from your PDF files. Perfect for saving photos, diagrams, and graphics without losing quality."
    >
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFiles=".pdf"
            maxSize={50}
            label="Upload PDF"
          />
        </div>

        {previews.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              📷 Preview Images Found
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="border rounded-lg p-2 dark:border-gray-700">
                  <img 
                    src={preview.data} 
                    alt={`Page ${preview.page}, Image ${preview.index}`}
                    className="w-full h-32 object-contain rounded"
                  />
                  <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
                    Page {preview.page} • Image {preview.index}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {file && (
          <div className="text-center">
            <button
              onClick={handleExtract}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Extracting Images...' : '📥 Extract All Images (ZIP)'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  );
};

export default PdfExtractImages;