import { describe, expect, it } from "vitest";

import {
  buildNewsletterMailto,
  isValidEmail,
} from "./newsletterSignup";

describe("newsletterSignup", () => {
  it("validates common email shapes", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("  user@example.com  ")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("builds a mailto link without calling remote services", () => {
    expect(buildNewsletterMailto("user@example.com", "hello@pdf.example")).toBe(
      "mailto:hello@pdf.example?subject=pdfToPng%20newsletter%20interest&body=Please%20keep%20me%20updated%20about%20pdfToPng.%0A%0AEmail%3A%20user%40example.com%0A",
    );
  });
});
