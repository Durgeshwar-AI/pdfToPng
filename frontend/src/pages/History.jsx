import { useHistory } from "../context/HistoryContext";
import { Trash2, Clock, FileText } from "lucide-react";
 
function HistoryItem({ entry }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
            {entry.fileName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {entry.conversionType} - {entry.timestamp}
          </p>
        </div>
      </div>
      <a
        href={entry.downloadUrl}
        download={entry.downloadName}
        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium"
      >
        Download
      </a>
    </div>
  );
}
 
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Clock className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-400 mb-2">
        No conversions yet
      </h2>
      <p className="text-gray-400 text-sm">
        Your conversion history will appear here during this session.
      </p>
    </div>
  );
}
 
function History() {
  const { history, clearHistory } = useHistory();
 
  return (
    <div className="w-full max-w-[800px] mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Conversion History</h1>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>
 
      {history.length === 0 && <EmptyState />}
 
      {history.length > 0 && (
        <div className="space-y-3">
          {history.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
 
      <p className="text-center text-xs text-gray-400 mt-8">
        History is session-based and clears when you close the tab.
      </p>
    </div>
  );
}
 
export default History;