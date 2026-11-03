import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Markdown to DOCX", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/md-to-docx");
  });
});
