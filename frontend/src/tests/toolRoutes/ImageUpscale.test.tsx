import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image Upscaling", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-upscale");
  });
});
