import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image Watermark", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-watermark");
  });
});
