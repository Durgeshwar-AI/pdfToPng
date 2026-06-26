import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadArea from '../components/FileUploadArea';
import { FileText } from 'lucide-react';
import { toastError, toastSuccess } from '../utils/toast';

function CsvToJson() {
  const [jsonOutput, setJsonOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const validateFile = useCallback(selectedFile => {
    if (
      selectedFile &&
      (selectedFile.type === 'text/csv' || selectedFile.name.toLowerCase().endsWith('.csv'))
    ) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected`,
      };
    }

    return {
      isValid: false,
      message: 'Please select a valid CSV file.',
    };
  }, []);

  const {
    file,
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
  } = useFileUpload(validateFile);

  const handleConvert = () => {
    if (!file) {
      toastError('Please select a CSV file first.');
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: results => {
        setJsonOutput(JSON.stringify(results.data, null, 2));
        toastSuccess('CSV converted successfully!');
        setLoading(false);
      },
      error: () => {
        toastError('Failed to parse CSV file.');
        setLoading(false);
      },
    });
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.csv$/i, '.json');
    a.click();

    URL.revokeObjectURL(url);

    toastSuccess('JSON downloaded successfully!');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonOutput);
    toastSuccess('JSON copied to clipboard!');
  };

  return (
    <div className="theme-panel mx-auto flex w-full max-w-[900px] flex-col items-center justify-center overflow-hidden rounded-2xl p-10 text-center">
      <h1 className="relative mb-10 inline-block text-5xl font-bold tracking-tight text-[var(--color-app-text)] after:absolute after:-bottom-2.5 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-sm after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:content-['']">
        CSV to JSON
      </h1>

      <p className="-mt-6 mb-8 text-sm text-gray-800">
        Convert CSV files into structured JSON instantly.
      </p>

      <div className="flex w-full flex-col items-center">
        <FileUploadArea
          file={file}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          dropAreaRef={dropAreaRef}
          handleFileChange={handleFileChange}
          handleClear={handleClear}
          handleDragEnter={handleDragEnter}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleAreaClick={handleAreaClick}
          accept=".csv,text/csv"
          inputId="csv-json-input"
          defaultIcon={<FileText className="h-16 w-16" />}
          defaultText="Upload a CSV file"
          supportText="Converts CSV data into JSON format"
        />

        <button
          onClick={handleConvert}
          disabled={!file || loading}
          className="mt-6 w-full max-w-[300px] rounded-lg bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-8 py-3.5 text-lg font-semibold text-white"
        >
          {loading ? 'Converting...' : 'Convert to JSON'}
        </button>

        {jsonOutput && (
          <div className="mt-8 w-full">
            <div className="mb-4 flex justify-center gap-4">
              <button onClick={handleCopy} className="rounded-lg bg-green-600 px-5 py-2 text-white">
                Copy JSON
              </button>

              <button
                onClick={handleDownload}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white"
              >
                Download JSON
              </button>
            </div>

            <pre className="max-h-[500px] overflow-auto rounded-lg border border-slate-300 bg-white p-4 text-left text-sm text-black dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              {jsonOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CsvToJson;
