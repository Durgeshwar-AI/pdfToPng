import { PDFDocument, PDFPage, degrees } from "pdf-lib";

export type PageTransform = {
  currentRotation: number;
  currentFlippedH: boolean;
  currentFlippedV: boolean;
};

function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}

/**
 * Apply preview flips to a copied page by mirroring content in-place,
 * then set the page rotation to match the thumbnail preview.
 */
export function applyPageTransform(page: PDFPage, transform: PageTransform) {
  const rotation = normalizeRotation(transform.currentRotation);
  const flipH = Boolean(transform.currentFlippedH);
  const flipV = Boolean(transform.currentFlippedV);

  if (flipH || flipV) {
    const { width, height } = page.getSize();
    const xScale = flipH ? -1 : 1;
    const yScale = flipV ? -1 : 1;

    page.scaleContent(xScale, yScale);
    page.translateContent(flipH ? width : 0, flipV ? height : 0);
    page.scaleAnnotations(xScale, yScale);
  }

  page.setRotation(degrees(rotation));
}

export async function buildTransformedPdf(
  sourceBytes: ArrayBuffer | Uint8Array,
  pages: Array<PageTransform & { originalPageNum: number }>,
  shouldTransform: (originalPageNum: number) => boolean,
  onProgress?: (progress: number) => void,
) {
  const originalPdfDoc = await PDFDocument.load(sourceBytes);
  const newPdfDoc = await PDFDocument.create();
  const total = pages.length;

  for (let i = 0; i < pages.length; i++) {
    const pageItem = pages[i];
    const originalIndex = pageItem.originalPageNum - 1;
    const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [
      originalIndex,
    ]);

    if (shouldTransform(pageItem.originalPageNum)) {
      applyPageTransform(copiedPage, pageItem);
    }

    newPdfDoc.addPage(copiedPage);
    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  return newPdfDoc.save();
}
