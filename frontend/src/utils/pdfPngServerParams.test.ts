import { describe, it, expect } from "vitest";
import { resolveServerPageRange } from "./pdfPngServerParams";

// Regression coverage for the maintainer's question on this PR
// ("Is the frontend updated?"): the backend added start_page/end_page
// params to /convertPng (#450), but the UI's server-fallback path wasn't
// sending them. These tests pin down the translation from UI state (page
// mode selection) to the params the server fallback now sends.

describe("resolveServerPageRange", () => {
  it("returns a single-page range for pageMode='single'", () => {
    expect(
      resolveServerPageRange({
        pageMode: "single",
        singlePage: "3",
        pageRange: "",
        totalPages: 10,
      })
    ).toEqual({ start_page: 3, end_page: 3 });
  });

  it("clamps an out-of-bounds single page to the document's page count", () => {
    expect(
      resolveServerPageRange({
        pageMode: "single",
        singlePage: "99",
        pageRange: "",
        totalPages: 10,
      })
    ).toEqual({ start_page: 10, end_page: 10 });
  });

  it("falls back to page 1 for an unparseable single page value", () => {
    expect(
      resolveServerPageRange({
        pageMode: "single",
        singlePage: "not-a-number",
        pageRange: "",
        totalPages: 10,
      })
    ).toEqual({ start_page: 1, end_page: 1 });
  });

  it("collapses a comma-separated range list to its min/max span", () => {
    expect(
      resolveServerPageRange({
        pageMode: "range",
        singlePage: "1",
        pageRange: "1-3, 5, 8-10",
        totalPages: 20,
      })
    ).toEqual({ start_page: 1, end_page: 10 });
  });

  it("handles a single page number in range mode", () => {
    expect(
      resolveServerPageRange({
        pageMode: "range",
        singlePage: "1",
        pageRange: "7",
        totalPages: 20,
      })
    ).toEqual({ start_page: 7, end_page: 7 });
  });

  it("falls back to the full document when range mode has no usable input", () => {
    expect(
      resolveServerPageRange({
        pageMode: "range",
        singlePage: "1",
        pageRange: "   ",
        totalPages: 15,
      })
    ).toEqual({ start_page: 1, end_page: 15 });
  });

  it("covers the whole document for pageMode='all'", () => {
    expect(
      resolveServerPageRange({
        pageMode: "all",
        singlePage: "1",
        pageRange: "",
        totalPages: 42,
      })
    ).toEqual({ start_page: 1, end_page: 42 });
  });

  it("defaults end_page to 1 when totalPages is unknown (e.g. preview never loaded)", () => {
    expect(
      resolveServerPageRange({
        pageMode: "all",
        singlePage: "1",
        pageRange: "",
        totalPages: 0,
      })
    ).toEqual({ start_page: 1, end_page: 1 });
  });
});
