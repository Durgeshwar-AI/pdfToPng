import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("DOCX to PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/docx-to-pdf");
  });
});
