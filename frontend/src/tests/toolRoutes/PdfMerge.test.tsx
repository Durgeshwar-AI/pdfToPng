import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Merge", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-merge");
  });
});
