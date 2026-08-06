export const MAX_REORDER_PAGES = 50;

export function isReorderPageLimitExceeded(pageCount: number) {
  return pageCount > MAX_REORDER_PAGES;
}

/**
 * True when a preview array was capped and cannot represent the full source PDF.
 * Used to prevent successful-looking truncated exports.
 */
export function isTruncatedReorderPreview(
  pageCount: number,
  previewCount: number,
) {
  return (
    isReorderPageLimitExceeded(pageCount) &&
    previewCount > 0 &&
    previewCount < pageCount
  );
}

export function canExportReorderedPages({
  pageCount,
  previewCount,
  pageLimitExceeded = false,
}: {
  pageCount: number | null | undefined;
  previewCount: number;
  pageLimitExceeded?: boolean;
}) {
  if (pageLimitExceeded) return false;
  if (!pageCount || previewCount === 0) return false;
  if (isReorderPageLimitExceeded(pageCount)) return false;
  if (isTruncatedReorderPreview(pageCount, previewCount)) return false;
  return true;
}
