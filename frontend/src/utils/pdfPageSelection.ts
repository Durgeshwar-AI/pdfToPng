export interface PdfPagePreview {
  originalPageNum: number;
  currentRotation: number;
  currentFlippedH: boolean;
  currentFlippedV: boolean;
}

export function buildExportPages(
  previews: PdfPagePreview[],
  totalPages: number,
  removedPageNumbers: number[] = [],
) {
  const previewedPageNumbers = new Set(
    previews.map((preview) => preview.originalPageNum),
  );
  const removedPages = new Set(removedPageNumbers);
  const remainingPages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(
      (pageNumber) =>
        !previewedPageNumbers.has(pageNumber) && !removedPages.has(pageNumber),
    )
    .map((originalPageNum) => ({
      originalPageNum,
      currentRotation: 0,
      currentFlippedH: false,
      currentFlippedV: false,
    }));

  return [...previews, ...remainingPages];
}
