import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF to Text", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-text");
  });
});
