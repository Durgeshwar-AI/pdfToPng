import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Protect PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-protect");
  });
});
