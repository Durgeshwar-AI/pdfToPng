import { createContext, useContext } from "react";
import type { HistoryEntry } from "./HistoryContext";

export interface HistoryEntryInput {
  fileName?: string;
  conversionType?: string;
  downloadUrl: string;
  downloadName?: string;
}

export interface HistoryContextValue {
  history: HistoryEntry[];
  addToHistory: (
    entryOrUrl: string | HistoryEntryInput,
    downloadName?: string,
  ) => void;
  clearHistory: () => void;
}

export const HistoryContext = createContext<
  HistoryContextValue | undefined
>(undefined);

export const useHistory = (): HistoryContextValue => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
};
