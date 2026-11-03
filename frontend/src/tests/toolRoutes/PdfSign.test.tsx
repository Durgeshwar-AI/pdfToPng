import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Sign", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-sign");
  });
});
