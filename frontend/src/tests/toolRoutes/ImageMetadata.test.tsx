import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image Metadata", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-metadata");
  });
});
