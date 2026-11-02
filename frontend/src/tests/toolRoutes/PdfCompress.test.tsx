import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Compressor", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-compress");
  });
});
