const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  const email = value.trim();
  return EMAIL_PATTERN.test(email);
}

export function buildNewsletterMailto(email: string, contactAddress: string) {
  const trimmedEmail = email.trim();
  const subject = encodeURIComponent("pdfToPng newsletter interest");
  const body = encodeURIComponent(
    `Please keep me updated about pdfToPng.\n\nEmail: ${trimmedEmail}\n`,
  );
  return `mailto:${contactAddress}?subject=${subject}&body=${body}`;
}
