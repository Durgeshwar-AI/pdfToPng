import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Split", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-split");
  });
});
