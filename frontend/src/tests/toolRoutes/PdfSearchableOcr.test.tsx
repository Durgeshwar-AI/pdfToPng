import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Scanned PDF OCR", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-searchable-ocr");
  });
});
