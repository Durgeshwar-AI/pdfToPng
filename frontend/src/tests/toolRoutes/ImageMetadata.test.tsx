import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Image Metadata", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-metadata");
  });
});
