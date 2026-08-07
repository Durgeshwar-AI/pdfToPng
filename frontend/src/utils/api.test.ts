import { describe, expect, it } from "vitest";

import { buildApiUrl } from "./api";

describe("buildApiUrl", () => {
  it("uses the configured cross-origin backend URL", () => {
    expect(buildApiUrl("/convertPng", "https://api.example.com")).toBe(
      "https://api.example.com/convertPng",
    );
  });

  it("normalizes duplicate joining slashes", () => {
    expect(buildApiUrl("/convertPng", "http://localhost:5000/")).toBe(
      "http://localhost:5000/convertPng",
    );
  });
});
