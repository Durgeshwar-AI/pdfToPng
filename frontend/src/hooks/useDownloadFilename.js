import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildDownloadName, sanitizeFilenameInput } from "../utils/fileNames";

/**
 * Manages a suggested + user-editable download filename.
 * The suggested name is derived synchronously so it appears on the same
 * render as the upload — no waiting for useEffect.
 */
export function useDownloadFilename({
  originalName,
  tool,
  detail,
  extension,
  getDownloadFilename,
  enabled = true,
}) {
  const [userEditedName, setUserEditedName] = useState("");
  const [isUserEdited, setIsUserEdited] = useState(false);
  const [forcedName, setForcedName] = useState(null);
  const prevSourceRef = useRef(originalName);

  const buildName = useCallback(
    (overrides = {}) => {
      if (!originalName) return "";
      if (getDownloadFilename && !overrides.tool && !overrides.detail && !overrides.extension) {
        return getDownloadFilename(originalName);
      }
      return buildDownloadName({
        originalName,
        tool: overrides.tool ?? tool,
        detail: overrides.detail ?? detail,
        extension: overrides.extension ?? extension,
      });
    },
    [originalName, tool, detail, extension, getDownloadFilename],
  );

  const suggestedName = useMemo(() => {
    if (!enabled || !originalName) return "";
    return buildName();
  }, [enabled, originalName, buildName]);

  useEffect(() => {
    if (originalName !== prevSourceRef.current) {
      prevSourceRef.current = originalName;
      setIsUserEdited(false);
      setUserEditedName("");
      setForcedName(null);
    }
  }, [originalName]);

  useEffect(() => {
    if (!isUserEdited) {
      setForcedName(null);
    }
  }, [detail, tool, extension, isUserEdited]);

  const downloadFilename = isUserEdited
    ? userEditedName
    : forcedName ?? suggestedName;

  const setDownloadFilename = useCallback((value) => {
    setIsUserEdited(true);
    setForcedName(null);
    if (typeof value === "function") {
      setUserEditedName((prev) => {
        const base = prev || forcedName || suggestedName;
        return sanitizeFilenameInput(value(base));
      });
      return;
    }
    setUserEditedName(sanitizeFilenameInput(value));
  }, [forcedName, suggestedName]);

  const setSuggestedName = useCallback(
    (overrides = {}) => {
      if (!originalName) {
        setIsUserEdited(false);
        setUserEditedName("");
        setForcedName(null);
        return;
      }
      setIsUserEdited(false);
      setUserEditedName("");
      setForcedName(buildName(overrides));
    },
    [originalName, buildName],
  );

  const resetDownloadFilename = useCallback(() => {
    setIsUserEdited(false);
    setUserEditedName("");
    setForcedName(null);
  }, []);

  const resolveFilename = useCallback(
    (fallback, overrides) => {
      if (isUserEdited) {
        return userEditedName || fallback || suggestedName;
      }
      if (overrides && originalName) {
        return buildName(overrides);
      }
      return downloadFilename || fallback || suggestedName;
    },
    [isUserEdited, userEditedName, downloadFilename, suggestedName, originalName, buildName],
  );

  return {
    downloadFilename,
    setDownloadFilename,
    setSuggestedName,
    resetDownloadFilename,
    resolveFilename,
  };
}
