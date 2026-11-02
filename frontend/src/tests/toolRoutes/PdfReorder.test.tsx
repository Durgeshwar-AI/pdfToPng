import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Reorder Pages", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-reorder");
  });
});
