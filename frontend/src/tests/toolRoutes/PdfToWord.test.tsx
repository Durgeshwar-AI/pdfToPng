import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("PDF to Word", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-word");
  });
});
