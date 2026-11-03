import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Unlock PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-unlock");
  });
});
