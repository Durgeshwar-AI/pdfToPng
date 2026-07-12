import { useCallback, useState } from "react";
import Papa from "papaparse";
import { useFileUpload } from "../hooks/useFileUpload";
import FileUploadArea from "../components/FileUploadArea";
import PrimaryButton from "../components/UI/PrimaryButton";
import { FileText } from "lucide-react";
import { toastError, toastSuccess } from "../utils/toast";
import { useHistory } from "../context/HistoryContext";

function CsvToJson() {
  const [jsonOutput, setJsonOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToHistory } = useHistory();

  const validateFile = useCallback(async (selectedFile: any) => {
    if (
      selectedFile &&
      (selectedFile.type === "text/csv" ||
        selectedFile.name.toLowerCase().endsWith(".csv"))
    ) {
      return {
        isValid: true,
        message: `File "${selectedFile.name}" selected`,
      };
    }
    return {
      isValid: false,
      message: "Please select a valid CSV file.",
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
      toastError("Please select a CSV file first.");
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const json = JSON.stringify(results.data, null, 2);
        setJsonOutput(json);
        toastSuccess("CSV converted successfully!");
        setLoading(false);

        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const downloadName = file.name.replace(/\.csv$/i, ".json");
        addToHistory({
          fileName: file.name,
          conversionType: "CSV to JSON",
          downloadUrl: url,
          downloadName: downloadName,
        });
      },
      error: () => {
        toastError("Failed to parse CSV file.");
        setLoading(false);
      },
    });
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.csv$/i, ".json");
    a.click();
    URL.revokeObjectURL(url);
    toastSuccess("JSON downloaded successfully!");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonOutput);
    toastSuccess("JSON copied to clipboard!");
  };

  return (
    <div className="w-full max-w-[900px] mx-auto p-10 text-center flex flex-col justify-center items-center theme-panel rounded-2xl overflow-hidden">
      <h1 className="mb-10 text-[var(--color-app-text)] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        CSV to JSON
      </h1>

      <p className="text-gray-800 text-sm mb-8 -mt-6">
        Convert CSV files into structured JSON instantly.
      </p>

      <div className="w-full flex flex-col items-center">
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
          defaultIcon={<FileText className="w-16 h-16" />}
          defaultText="Upload a CSV file"
          supportText="Converts CSV data into JSON format"
        />

        <PrimaryButton
          onClick={handleConvert}
          disabled={!file || loading}
          className="mt-6"
        >
          {loading ? "Converting..." : "Convert to JSON"}
        </PrimaryButton>

        {jsonOutput && (
          <div className="w-full mt-8">
            <div className="flex gap-4 justify-center mb-4">
              <button
                onClick={handleCopy}
                className="px-5 py-2 rounded-lg bg-green-600 text-white"
              >
                Copy JSON
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white"
              >
                Download JSON
              </button>
            </div>
            <pre className="text-left bg-white dark:bg-slate-900 text-black dark:text-white p-4 rounded-lg overflow-auto max-h-[500px] text-sm border border-slate-300 dark:border-slate-700">
              {jsonOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CsvToJson;
