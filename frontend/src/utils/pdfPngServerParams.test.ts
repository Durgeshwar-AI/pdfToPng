import { describe, it, expect } from "vitest";
import { resolveServerDpi } from "./pdfPngServerParams";

// Regression coverage for the maintainer's question on this PR
// ("frontend update?"): the backend added a dpi param to /convertPng (#448),
// but the UI's server-fallback path wasn't sending it. These tests pin down
// the translation from the UI's DPI/Quality slider (a canvas scale factor)
// to the dpi value the server fallback now sends.

describe("resolveServerDpi", () => {
  it("converts the default 2.0x scale to 144 DPI", () => {
    expect(resolveServerDpi(2.0)).toBe(144);
  });

  it("converts 1.0x scale to the 72 DPI floor", () => {
    expect(resolveServerDpi(1.0)).toBe(72);
  });

  it("clamps a scale that would exceed the backend's 600 DPI ceiling", () => {
    // 600/72 ≈ 8.33x -- the UI slider only goes to 5x (360 DPI) today, but
    // this guards the clamp itself against a future slider range change.
    expect(resolveServerDpi(10)).toBe(600);
  });

  it("clamps a scale below the backend's 72 DPI floor", () => {
    expect(resolveServerDpi(0.1)).toBe(72);
  });

  it("rounds to the nearest whole DPI", () => {
    expect(resolveServerDpi(2.5)).toBe(180);
  });
});
