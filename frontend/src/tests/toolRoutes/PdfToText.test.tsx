import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF to Text", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-text");
  });
});
