import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Image Watermark", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-watermark");
  });
});
