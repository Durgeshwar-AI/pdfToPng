import { PDFDocument } from "@cantoo/pdf-lib";

export async function encryptPdf(file: File, password: string): Promise<Blob> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  document.encrypt({
    ownerPassword: password,
    userPassword: password,
    algorithm: "AES-256",
  });
  return new Blob([await document.save()], { type: "application/pdf" });
}

export async function decryptPdf(file: File, password: string): Promise<Blob> {
  const document = await PDFDocument.load(await file.arrayBuffer(), { password });
  return new Blob([await document.save()], { type: "application/pdf" });
}

export async function compressPdf(file: File, level: "low" | "medium" | "high" = "medium"): Promise<Blob> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  return new Blob(
    [await document.save({ useObjectStreams: level !== "low", addDefaultPage: false })],
    { type: "application/pdf" },
  );
}

export function downloadBlob(blob: Blob, downloadName: string): string {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = downloadName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return url;
}
