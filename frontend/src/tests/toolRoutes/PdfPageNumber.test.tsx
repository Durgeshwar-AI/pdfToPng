import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Page Numbering", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-page-number");
  });
});
