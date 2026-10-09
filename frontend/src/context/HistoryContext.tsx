import {
  useState,
  type ReactNode,
} from "react";
import {
  HistoryContext,
  type HistoryContextValue,
  type HistoryEntryInput,
} from "./history-context";

export interface HistoryEntry {
  id: number;
  fileName: string;
  conversionType: string;
  timestamp: string;
  downloadUrl: string;
  downloadName: string;
}

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider = ({ children }: HistoryProviderProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addToHistory: HistoryContextValue["addToHistory"] = (
    entryOrUrl,
    downloadName,
  ) => {
    const entryName =
      typeof entryOrUrl === "string"
        ? downloadName || "converted-file"
        : entryOrUrl.fileName || "converted-file";

    const entry: HistoryEntry = {
      id: Date.now(),
      fileName: entryName,
      conversionType:
        typeof entryOrUrl === "string"
          ? "Conversion"
          : entryOrUrl.conversionType || "Conversion",
      timestamp: new Date().toLocaleString(),
      downloadUrl:
        typeof entryOrUrl === "string"
          ? entryOrUrl
          : entryOrUrl.downloadUrl,
      downloadName:
        typeof entryOrUrl === "string"
          ? downloadName || "converted-file"
          : entryOrUrl.downloadName || entryName,
    };

    setHistory((previousHistory) => [entry, ...previousHistory]);
  };

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};