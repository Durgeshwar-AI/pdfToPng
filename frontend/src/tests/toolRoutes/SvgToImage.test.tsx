import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("SVG to Image", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/svg-to-image");
  });
});
