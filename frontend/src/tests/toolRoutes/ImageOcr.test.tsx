import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image OCR", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-ocr");
  });
});
