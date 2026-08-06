import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getPdfFiles } from "../utils/fileSelection";
import MergePdf from "./PdfMerge";

function createFileList(files: File[]) {
  return {
    length: files.length,
    item: (index: number) => files[index] ?? null,
    ...files,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  } as unknown as FileList;
}

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

describe("MergePdf", () => {
  it("keeps two same-name PDFs in the select queue", () => {
    const { container } = render(<MergePdf />);
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const firstReport = new File(["first"], "report.pdf", {
      type: "application/pdf",
    });
    const secondReport = new File(["second"], "report.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, {
      target: { files: createFileList([firstReport, secondReport]) },
    });

    expect(screen.getByText("2 files")).toBeInTheDocument();
    expect(screen.getAllByTitle("report.pdf")).toHaveLength(2);
  });
});
