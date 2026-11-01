import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("HEIC to JPG or PNG", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/heic-to-jpg");
  });
});
