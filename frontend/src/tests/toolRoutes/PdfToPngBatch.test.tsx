import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Batch PDF to PNG", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-to-png-batch");
  });
});
