import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Image to JPG", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-to-jpg");
  });
});
