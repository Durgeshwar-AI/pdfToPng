import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Image to WebP", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-to-webp");
  });
});
