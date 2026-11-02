import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("CSV to JSON", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/csv-to-json");
  });
});
