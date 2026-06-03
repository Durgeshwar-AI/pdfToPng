/**
 * Triggers a browser download for a Blob or object URL.
 */
export function triggerDownload(source, filename) {
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  if (typeof source !== "string") {
    URL.revokeObjectURL(url);
  }
}
