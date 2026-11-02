import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Unlock PDF", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-unlock");
  });
});
