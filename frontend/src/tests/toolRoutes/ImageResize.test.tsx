import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image Resize", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-resize");
  });
});
