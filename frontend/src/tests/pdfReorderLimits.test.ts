import { describe, expect, it } from "vitest";

import {
  MAX_REORDER_PAGES,
  canExportReorderedPages,
  isReorderPageLimitExceeded,
  isTruncatedReorderPreview,
} from "./pdfReorderLimits";

describe("pdfReorderLimits", () => {
  it("flags PDFs above the reorder page cap", () => {
    expect(isReorderPageLimitExceeded(MAX_REORDER_PAGES)).toBe(false);
    expect(isReorderPageLimitExceeded(MAX_REORDER_PAGES + 1)).toBe(true);
  });

  it("detects truncated 51-page previews that would drop later pages", () => {
    expect(isTruncatedReorderPreview(51, 50)).toBe(true);
    expect(isTruncatedReorderPreview(50, 50)).toBe(false);
    expect(isTruncatedReorderPreview(50, 49)).toBe(false);
  });

  it("blocks export for oversized or truncated reorder inputs", () => {
    expect(
      canExportReorderedPages({
        pageCount: 51,
        previewCount: 50,
        pageLimitExceeded: true,
      }),
    ).toBe(false);

    expect(
      canExportReorderedPages({
        pageCount: 51,
        previewCount: 50,
      }),
    ).toBe(false);

    expect(
      canExportReorderedPages({
        pageCount: 50,
        previewCount: 50,
      }),
    ).toBe(true);

    // User-removed pages are allowed as long as the source was within the limit.
    expect(
      canExportReorderedPages({
        pageCount: 10,
        previewCount: 9,
      }),
    ).toBe(true);
  });
});
