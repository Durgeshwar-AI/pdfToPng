import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF to Word", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-word");
  });
});
