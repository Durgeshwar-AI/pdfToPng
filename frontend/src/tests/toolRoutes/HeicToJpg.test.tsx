import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("HEIC to JPG or PNG", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/heic-to-jpg");
  });
});
