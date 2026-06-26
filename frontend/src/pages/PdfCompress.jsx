import { useCallback, useState } from 'react';
import ToolPageTemplate from '../components/ToolPageTemplate';
import { FileText, Zap, Maximize, ShieldCheck } from 'lucide-react';
import { formatFileSize, calculateSavedPercentage } from '../utils/fileSizeFormatter';

function PdfCompress() {
  const [level, setLevel] = useState('medium');
  const [originalSize, setOriginalSize] = useState(null);
  const [convertedSize, setConvertedSize] = useState(null);

  const presets = [
    {
      name: 'Low',
      value: 'low',
      icon: <Maximize className="h-4 w-4" />,
      desc: 'Faster, mild reduction',
    },
    {
      name: 'Medium',
      value: 'medium',
      icon: <Zap className="h-4 w-4" />,
      desc: 'Balanced compression',
    },
    {
      name: 'High',
      value: 'high',
      icon: <ShieldCheck className="h-4 w-4" />,
      desc: 'Maximum reduction',
    },
  ];

  const validateFile = useCallback(selectedFile => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setOriginalSize(selectedFile.size);
      setConvertedSize(null);
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      };
    }
    return { isValid: false, message: 'Error: Please select a PDF file' };
  }, []);

  const modifyFormData = formData => {
    formData.append('level', level);
  };

  const onSuccess = responseBlob => {
    setConvertedSize(responseBlob.size);
    return `Success! PDF compressed at ${level} level.`;
  };

  const extraFields = ({ file }) => {
    if (!file) return null;

    return (
      <div className="mb-8 w-full max-w-[500px] rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm">
        <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Zap className="h-4 w-4 text-blue-500" />
          Compression Level
        </label>

        <div className="grid grid-cols-3 gap-3">
          {presets.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setLevel(p.value)}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-3 text-xs font-bold transition-all ${
                level === p.value
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'
              }`}
            >
              {p.icon}
              {p.name}
              <span className="text-center text-[10px] font-normal">{p.desc}</span>
            </button>
          ))}
        </div>

        {convertedSize && originalSize && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">📊 File Size Comparison</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Original:</span>
                <span className="font-medium text-gray-700">{formatFileSize(originalSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Compressed:</span>
                <span className="font-medium text-green-600">{formatFileSize(convertedSize)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-500">Saved:</span>
                <span
                  className={`font-bold ${calculateSavedPercentage(originalSize, convertedSize) > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatFileSize(originalSize - convertedSize)} (
                  {calculateSavedPercentage(originalSize, convertedSize).toFixed(1)}%
                  {calculateSavedPercentage(originalSize, convertedSize) > 0 ? '↓' : '↑'})
                </span>
              </div>
            </div>
          </div>
        )}

        {!convertedSize && originalSize && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">
              Click "Compress PDF" to see file size comparison.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="PDF Compressor"
      accept=".pdf,application/pdf"
      validateFile={validateFile}
      apiEndpoint="/compress-pdf"
      fileFieldName="file"
      modifyFormData={modifyFormData}
      getDownloadFilename={fileName => fileName.replace(/\.pdf$/i, '_compressed.pdf')}
      submitButtonText="Compress PDF"
      loadingButtonText="Compressing..."
      onSuccess={onSuccess}
      extraFields={extraFields}
      maxWidthClass="max-w-[700px]"
      defaultIcon={<FileText className="h-16 w-16" />}
      defaultText="Upload a PDF to compress"
      supportText="Reduce PDF file size with no extra dependencies"
      inputId="pdf-compress-input"
    />
  );
}

export default PdfCompress;
