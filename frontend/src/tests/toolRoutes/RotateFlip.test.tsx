import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Rotate and Flip", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/rotate-flip");
  });
});
