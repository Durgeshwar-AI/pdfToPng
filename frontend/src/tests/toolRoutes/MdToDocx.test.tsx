import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Markdown to DOCX", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/md-to-docx");
  });
});
