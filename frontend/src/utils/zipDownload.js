import JSZip from "jszip";

/** Trigger a single file download from a Blob. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Build a safe ZIP filename from the original upload name. */
export function buildZipFilename(sourceName, suffix = "pages") {
  const base = (sourceName || "converted")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "converted";
  return `${base}_${suffix}.zip`;
}

/** Bundle multiple files into one ZIP and download it. */
export async function downloadFilesAsZip(files, zipFilename) {
  const zip = new JSZip();
  for (const { name, blob } of files) {
    zip.file(name, blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, zipFilename);
}
