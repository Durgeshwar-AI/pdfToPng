import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF to PNG", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-png");
  });
});
