import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Sign", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-sign");
  });
});
