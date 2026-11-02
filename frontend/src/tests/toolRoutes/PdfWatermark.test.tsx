import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Watermark", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-watermark");
  });
});
