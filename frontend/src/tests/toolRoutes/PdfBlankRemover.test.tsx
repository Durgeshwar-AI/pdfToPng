import { describe, it } from "vitest";
import { expectToolRouteToRender } from "../toolRoute.test";

describe("Blank Page Remover", () => {
  it("renders its tool route", async () => {
    await expectToolRouteToRender("/pdf-blank-remover");
  });
});
