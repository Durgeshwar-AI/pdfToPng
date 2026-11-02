import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("URL to QR Code", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/url-to-qr");
  });
});
