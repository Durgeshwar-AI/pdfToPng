import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("PDF Metadata Editor", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-metadata");
  });
});
