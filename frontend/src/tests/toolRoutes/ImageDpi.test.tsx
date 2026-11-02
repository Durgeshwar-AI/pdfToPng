import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image DPI Converter", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-dpi");
  });
});
