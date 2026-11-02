import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Split", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-split");
  });
});
