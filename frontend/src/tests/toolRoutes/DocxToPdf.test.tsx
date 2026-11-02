import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("DOCX to PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/docx-to-pdf");
  });
});
