import { describe, expect, it } from "vitest";

import { buildExportPages } from "./pdfPageSelection";

const preview = (originalPageNum: number) => ({
  originalPageNum,
  currentRotation: 0,
  currentFlippedH: false,
  currentFlippedV: false,
});

describe("buildExportPages", () => {
  it("includes source pages beyond the 50-page preview limit", () => {
    const previews = Array.from({ length: 50 }, (_, index) => preview(index + 1));

    expect(buildExportPages(previews, 51).map((page) => page.originalPageNum)).toEqual(
      Array.from({ length: 51 }, (_, index) => index + 1),
    );
  });

  it("keeps preview reorder while omitting explicitly removed pages", () => {
    expect(
      buildExportPages([preview(2), preview(1)], 4, [3]).map(
        (page) => page.originalPageNum,
      ),
    ).toEqual([2, 1, 4]);
  });
});
