import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Batch PDF to PNG", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-png-batch");
  });
});
