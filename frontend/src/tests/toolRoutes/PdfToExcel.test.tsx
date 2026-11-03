import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF to Excel", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-excel");
  });
});
