import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Protect PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-protect");
  });
});
