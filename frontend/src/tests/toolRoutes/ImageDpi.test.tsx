import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Image DPI Converter", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-dpi");
  });
});
