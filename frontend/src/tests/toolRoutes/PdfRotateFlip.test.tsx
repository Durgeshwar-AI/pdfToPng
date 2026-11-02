import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Rotate and Flip", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-rotate-flip");
  });
});
