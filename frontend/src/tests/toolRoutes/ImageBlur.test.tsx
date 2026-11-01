import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image Blur", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-blur");
  });
});
