import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Scanned PDF OCR", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-searchable-ocr");
  });
});
