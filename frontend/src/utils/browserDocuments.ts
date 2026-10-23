import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { marked } from "marked";
import mammoth from "mammoth";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function markdownToHtml(markdown: string, theme: string): Promise<Blob> {
  const body = await marked.parse(markdown);
  const colors = theme === "dark"
    ? { background: "#111827", text: "#f9fafb" }
    : theme === "blue"
      ? { background: "#eff6ff", text: "#172554" }
      : { background: "#ffffff", text: "#111827" };
  return new Blob([`<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;
    background:${colors.background};color:${colors.text};line-height:1.6}
    pre{padding:16px;background:rgba(127,127,127,.15);overflow:auto} img{max-width:100%}
  </style></head><body>${body}</body></html>`], { type: "text/html" });
}

export async function markdownToDocx(markdown: string): Promise<Blob> {
  const tokens = marked.lexer(markdown);
  const paragraphs = tokens.flatMap((token) => {
    if (token.type === "heading") {
      return [new Paragraph({
        text: token.text,
        heading: token.depth === 1 ? HeadingLevel.HEADING_1 : token.depth === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
      })];
    }
    if (token.type === "code") return [new Paragraph({ children: [new TextRun({ text: token.text, font: "Courier New" })] })];
    if (token.type === "list") {
      return token.items.map((item) => new Paragraph({ text: item.text, bullet: { level: 0 } }));
    }
    if (token.type === "paragraph" || token.type === "blockquote") {
      return [new Paragraph({ text: token.text })];
    }
    return [];
  });
  const document = new Document({ sections: [{ children: paragraphs }] });
  return new Blob([await Packer.toBlob(document)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export async function docxToPdf(file: File): Promise<Blob> {
  const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  const container = document.createElement("div");
  container.innerHTML = result.value;
  Object.assign(container.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    padding: "48px",
    background: "white",
    color: "black",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.5",
  });
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, { scale: 1.5, backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    let offset = 0;
    while (offset < imageHeight) {
      if (offset > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, -offset, imageWidth, imageHeight);
      offset += pageHeight;
    }
    return pdf.output("blob");
  } finally {
    container.remove();
  }
}

export function downloadDocument(blob: Blob, name: string): string {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return url;
}
