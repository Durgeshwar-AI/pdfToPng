import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Image Upscaling", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-upscale");
  });
});
