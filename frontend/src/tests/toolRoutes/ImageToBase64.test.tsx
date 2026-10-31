import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("Image to Base64", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/image-to-base64");
  });
});
