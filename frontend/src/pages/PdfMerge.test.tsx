import { describe, expect, it } from "vitest";

import { getPdfFiles } from "../utils/fileSelection";

describe("getPdfFiles", () => {
  it("keeps distinct selected PDFs with the same filename", () => {
    const firstReport = new File(["first"], "report.pdf", {
      type: "application/pdf",
    });
    const secondReport = new File(["second"], "report.pdf", {
      type: "application/pdf",
    });

    expect(getPdfFiles([firstReport, secondReport])).toEqual([
      firstReport,
      secondReport,
    ]);
  });

  it("continues to reject non-PDF files", () => {
    const textFile = new File(["not a PDF"], "notes.txt", {
      type: "text/plain",
    });

    expect(getPdfFiles([textFile])).toEqual([]);
  });
});
