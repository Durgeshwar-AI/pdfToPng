import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF to Excel", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-excel");
  });
});
