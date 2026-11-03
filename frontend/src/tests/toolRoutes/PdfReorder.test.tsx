import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Reorder Pages", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-reorder");
  });
});
