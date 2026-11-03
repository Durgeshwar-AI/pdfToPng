import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Info", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-info");
  });
});
