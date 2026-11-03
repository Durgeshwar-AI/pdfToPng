import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Markdown to HTML", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/md-to-html");
  });
});
