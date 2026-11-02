import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Remove Background", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/remove-bg");
  });
});
