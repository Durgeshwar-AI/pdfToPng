import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("CSV to JSON", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/csv-to-json");
  });
});
