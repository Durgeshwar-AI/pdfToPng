import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Merge", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-merge");
  });
});
