import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PPTX to PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pptx-to-pdf");
  });
});
