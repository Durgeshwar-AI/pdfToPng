import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF Info", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-info");
  });
});
