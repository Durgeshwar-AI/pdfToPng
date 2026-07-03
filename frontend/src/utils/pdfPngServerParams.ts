export interface ResolvePageRangeArgs {
  // PdfPng.tsx keeps pageMode as plain component state (useState("all")),
  // not narrowed to a union type, so this accepts any string and treats
  // anything other than "single"/"range" the same as "all".
  pageMode: string;
  singlePage: string;
  pageRange: string;
  totalPages: number;
}

export interface ServerPageRange {
  start_page: number;
  end_page: number;
}

/**
 * The backend's /convertPng endpoint only accepts a single contiguous
 * [start_page, end_page] range (#450), not the arbitrary comma-separated
 * page list the client-side renderer supports (e.g. "1-3, 5"). This
 * collapses the user's selection to the smallest range that covers every
 * page they asked for, so a server fallback honors their choice as closely
 * as the backend's current capability allows, instead of silently
 * defaulting to page 1 only.
 */
export function resolveServerPageRange({
  pageMode,
  singlePage,
  pageRange,
  totalPages,
}: ResolvePageRangeArgs): ServerPageRange {
  if (pageMode === "single") {
    const pageNum = parseInt(singlePage, 10);
    const clamped = Number.isNaN(pageNum)
      ? 1
      : Math.min(Math.max(pageNum, 1), totalPages || pageNum);
    return { start_page: clamped, end_page: clamped };
  }

  if (pageMode === "range" && pageRange.trim()) {
    const pages: number[] = [];
    pageRange
      .split(",")
      .map((r) => r.trim())
      .forEach((r) => {
        if (r.includes("-")) {
          const [start, end] = r.split("-").map(Number);
          if (!Number.isNaN(start)) pages.push(start);
          if (!Number.isNaN(end)) pages.push(end);
        } else {
          const num = Number(r);
          if (!Number.isNaN(num)) pages.push(num);
        }
      });
    if (pages.length > 0) {
      return { start_page: Math.min(...pages), end_page: Math.max(...pages) };
    }
  }

  // "all" mode, or a "range" mode the user left empty/unparseable.
  return { start_page: 1, end_page: totalPages || 1 };
}
