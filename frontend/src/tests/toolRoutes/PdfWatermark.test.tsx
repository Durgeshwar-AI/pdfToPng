import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Watermark", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-watermark");
  });
});
