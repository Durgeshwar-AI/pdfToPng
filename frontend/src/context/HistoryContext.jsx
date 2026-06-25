import { createContext, useContext, useState } from "react";

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addToHistory = (entryOrUrl, downloadName) => {
    let entry;

    if (typeof entryOrUrl === "string") {
      entry = {
        id: Date.now(),
        fileName: downloadName || "converted-file",
        conversionType: "Conversion",
        timestamp: new Date().toLocaleString(),
        downloadUrl: entryOrUrl,
        downloadName: downloadName || "converted-file",
      };
    } else {
      entry = {
        id: Date.now(),
        fileName: entryOrUrl.fileName || "converted-file",
        conversionType: entryOrUrl.conversionType || "Conversion",
        timestamp: new Date().toLocaleString(),
        downloadUrl: entryOrUrl.downloadUrl,
        downloadName: entryOrUrl.downloadName || entryOrUrl.fileName,
      };
    }

    setHistory((prev) => [entry, ...prev]);
  };

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);