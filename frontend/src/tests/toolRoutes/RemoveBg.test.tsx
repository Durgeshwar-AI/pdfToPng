import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Remove Background", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/remove-bg");
  });
});
