import React, { useCallback, useState } from 'react';
import ToolPageTemplate from '../components/ToolPageTemplate';
import { Copy, Download, Check, Code } from 'lucide-react';
import { toastSuccess, toastError } from '../utils/toast';

function ImageBase64() {
  const [base64String, setBase64String] = useState('');
  const [copied, setCopied] = useState(false);

  const validateFile = useCallback(selectedFile => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected (${(selectedFile.size / 1024).toFixed(
          1
        )} KB)`,
      };
    }
    return {
      isValid: false,
      message: 'Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)',
    };
  }, []);

  const handleCustomSubmit = async ({ file, setLoading }) => {
    setBase64String('');
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64String(reader.result);
        setLoading(false);
        toastSuccess('Image converted to Base64 successfully!');
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toastError(error.message || 'Failed to convert file');
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = file => {
    if (!base64String || !file) return;
    const element = document.createElement('a');
    const fileBlob = new Blob([base64String], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.name.split('.')[0]}_base64.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearAll = () => {
    setBase64String('');
  };

  const extraContent = ({ file }) => {
    if (!base64String) return null;
    return (
      <div className="animate-in fade-in slide-in-from-top-4 mt-8 w-full text-left duration-500">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Base64 Data URI</h3>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => downloadAsTxt(file)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50"
            >
              <Download size={16} />
              Download .txt
            </button>
          </div>
        </div>
        <div className="group relative">
          <textarea
            readOnly
            value={base64String}
            className="h-48 w-full resize-none rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 font-mono text-xs break-all text-[#334155] focus:ring-2 focus:ring-[#4361ee]/20 focus:outline-none"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-[#f8fafc]/50"></div>
        </div>
        <p className="mt-2 text-left text-xs text-[#64748b] italic">
          * This string can be used directly in <code>&lt;img src="..." /&gt;</code> or CSS{' '}
          <code>url(...)</code>.
        </p>
      </div>
    );
  };

  return (
    <ToolPageTemplate
      title="Image to Base64"
      accept="image/*"
      validateFile={validateFile}
      onSubmit={handleCustomSubmit}
      onClear={handleClearAll}
      submitButtonText="Convert to Base64"
      loadingButtonText="Converting..."
      extraContent={extraContent}
      showSubmitButton={!base64String}
      maxWidthClass="max-w-[800px]"
      defaultIcon={<Code size={64} />}
      defaultText="Choose image file or drag & drop here"
      supportText="Supports PNG, JPG, JPEG, GIF, BMP, and more"
      inputId="image-input"
    />
  );
}

export default ImageBase64;
