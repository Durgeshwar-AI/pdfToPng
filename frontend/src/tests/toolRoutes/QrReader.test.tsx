import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRouteTest";

describe("QR Code Reader", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/qr-reader");
  });
});
