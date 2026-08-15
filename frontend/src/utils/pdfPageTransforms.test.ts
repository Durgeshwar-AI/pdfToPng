import { PDFDocument, rgb } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { applyPageTransform, buildTransformedPdf } from "./pdfPageTransforms";

async function createAsymmetricPdf() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([200, 100]);
  page.drawRectangle({
    x: 10,
    y: 10,
    width: 40,
    height: 20,
    color: rgb(0.9, 0.1, 0.1),
  });
  return doc.save();
}

function asBytes(bytes: Uint8Array) {
  return Array.from(bytes);
}

describe("applyPageTransform", () => {
  it("keeps rotation when no flips are requested", async () => {
    const sourceBytes = await createAsymmetricPdf();
    const source = await PDFDocument.load(sourceBytes);
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(source, [0]);

    applyPageTransform(page, {
      currentRotation: 90,
      currentFlippedH: false,
      currentFlippedV: false,
    });

    expect(page.getRotation().angle).toBe(90);
  });

  it("applies flip transforms without changing page size", async () => {
    const sourceBytes = await createAsymmetricPdf();
    const source = await PDFDocument.load(sourceBytes);
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(source, [0]);
    const before = page.getSize();

    applyPageTransform(page, {
      currentRotation: 0,
      currentFlippedH: true,
      currentFlippedV: true,
    });

    expect(page.getSize()).toEqual(before);
  });
});

describe("buildTransformedPdf", () => {
  it("exports flipped pages with different bytes than rotation-only output", async () => {
    const sourceBytes = await createAsymmetricPdf();

    const rotatedOnly = await buildTransformedPdf(
      sourceBytes,
      [
        {
          originalPageNum: 1,
          currentRotation: 0,
          currentFlippedH: false,
          currentFlippedV: false,
        },
      ],
      () => true,
    );

    const flippedHorizontal = await buildTransformedPdf(
      sourceBytes,
      [
        {
          originalPageNum: 1,
          currentRotation: 0,
          currentFlippedH: true,
          currentFlippedV: false,
        },
      ],
      () => true,
    );

    const flippedVertical = await buildTransformedPdf(
      sourceBytes,
      [
        {
          originalPageNum: 1,
          currentRotation: 0,
          currentFlippedH: false,
          currentFlippedV: true,
        },
      ],
      () => true,
    );

    const flippedBoth = await buildTransformedPdf(
      sourceBytes,
      [
        {
          originalPageNum: 1,
          currentRotation: 180,
          currentFlippedH: true,
          currentFlippedV: true,
        },
      ],
      () => true,
    );

    expect(asBytes(flippedHorizontal)).not.toEqual(asBytes(rotatedOnly));
    expect(asBytes(flippedVertical)).not.toEqual(asBytes(rotatedOnly));
    expect(asBytes(flippedHorizontal)).not.toEqual(asBytes(flippedVertical));
    expect(asBytes(flippedBoth)).not.toEqual(asBytes(rotatedOnly));

    const flippedDoc = await PDFDocument.load(flippedHorizontal);
    expect(flippedDoc.getPageCount()).toBe(1);
  });

  it("skips transforms outside the selected page scope", async () => {
    const sourceBytes = await createAsymmetricPdf();

    const untouched = await buildTransformedPdf(
      sourceBytes,
      [
        {
          originalPageNum: 1,
          currentRotation: 90,
          currentFlippedH: true,
          currentFlippedV: true,
        },
      ],
      () => false,
    );

    const transformed = await buildTransformedPdf(
      sourceBytes,
      [
        {
          originalPageNum: 1,
          currentRotation: 90,
          currentFlippedH: true,
          currentFlippedV: true,
        },
      ],
      () => true,
    );

    expect(asBytes(untouched)).not.toEqual(asBytes(transformed));
    const untouchedDoc = await PDFDocument.load(untouched);
    expect(untouchedDoc.getPage(0).getRotation().angle).toBe(0);
  });
});
