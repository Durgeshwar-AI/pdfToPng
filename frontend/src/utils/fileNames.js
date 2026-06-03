/*
  Strips the extension from a filename and trims whitespace.
  "My Report.pdf" → "My Report"
 */
export function stripExtension(filename) {
  return filename.replace(/\.[^/.]+$/, "").trim();
}

/*
 Sanitizes a string for use as a filename.
 Removes control characters; collapses whitespace; keeps letters,
 numbers, spaces, hyphens, dots, and parentheses; trims to 80 chars.
*/
export function sanitizeForFilename(s) {
  if (!s) return "";
  return s
    .normalize("NFKD")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")  // strip control chars
    .replace(/[<>:"/\\|?*]/g, "")                   // strip illegal filename chars
    .replace(/\s+/g, " ")                           // collapse whitespace
    .trim()
    .slice(0, 80) || "document";
}

/**
 * Builds a download filename.
 *
 * Pattern:  <base> [TOOL] [detail].<ext>
 * Examples:
 *   quarterly-report [split] pages 3-7.pdf
 *   photo [rotate] left.png
 *   contract [watermark].pdf
 *   invoice [signed].pdf
 *   headshot [no bg].png
 *
 * @param {object} opts
 * @param {string}  opts.originalName  - Raw filename from File object, e.g. "My Report.pdf"
 * @param {string}  opts.tool          - Short human label, e.g. "split" | "rotate" | "watermark"
 * @param {string} [opts.detail]       - Optional extra detail, e.g. "left" | "pages 3-7" | "90°"
 * @param {string} [opts.extension]    - Output extension without dot, e.g. "pdf" | "png"
 */
/** Strips control characters from user-edited filename input. */
export function sanitizeFilenameInput(value) {
  if (value == null) return "";
  return String(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, "");
}

export function buildDownloadName({ originalName, tool, detail, extension }) {
  const base = sanitizeForFilename(
    originalName ? stripExtension(originalName) : "document"
  );

  const tag = tool
    ? detail
      ? `[${tool}] ${detail}`
      : `[${tool}]`
    : "";

  const ext = extension ?? originalName?.split(".").pop() ?? "pdf";
  const name = [base, tag].filter(Boolean).join(" ");

  return `${name}.${ext}`;
}