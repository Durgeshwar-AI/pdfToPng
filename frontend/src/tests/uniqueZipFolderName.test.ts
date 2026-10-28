import { describe, expect, it } from "vitest";

import { uniqueZipFolderName } from "./uniqueZipFolderName";

describe("uniqueZipFolderName", () => {
  it("keeps the first name and suffixes later collisions", () => {
    const used = new Set<string>();

    expect(uniqueZipFolderName("report", used)).toBe("report");
    expect(uniqueZipFolderName("report", used)).toBe("report-2");
    expect(uniqueZipFolderName("report", used)).toBe("report-3");
    expect(uniqueZipFolderName("invoice", used)).toBe("invoice");
  });

  it("skips suffixes that are already claimed", () => {
    const used = new Set<string>(["report", "report-2"]);

    expect(uniqueZipFolderName("report", used)).toBe("report-3");
  });
});
