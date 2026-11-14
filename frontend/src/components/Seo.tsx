import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import tools from "../data/toolsData";

const SITE_URL = "https://pdftopng.vercel.app";
const SITE_NAME = "pdfToPng";
const DEFAULT_TITLE = "Free PDF & Image Tools Online | pdfToPng";
const DEFAULT_DESCRIPTION =
  "Free online PDF and image tools for converting, compressing, editing, and organizing files privately in your browser. No signup and no persistent file storage.";
const DEFAULT_KEYWORDS =
  "free online PDF tools, free image tools, PDF converter, image converter, browser file tools, private file processing";
const SOCIAL_IMAGE = `${SITE_URL}/og-image.svg`;

type Metadata = {
  title: string;
  description: string;
  keywords: string;
  noindex?: boolean;
};

const pageMetadata: Record<
  string,
  Metadata
> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  },
  "/about": {
    title: "About pdfToPng | Private Online File Tools",
    description:
      "Learn how pdfToPng provides free PDF and image tools with browser-first processing, no signup, and no persistent file storage.",
    keywords: "about pdfToPng, private PDF tools, browser file processing, client-side file tools",
  },
  "/privacy": {
    title: "Privacy Policy | pdfToPng",
    description:
      "Read the pdfToPng privacy policy and learn how files are processed without persistent storage.",
    keywords: "pdfToPng privacy policy, private PDF tools, browser file privacy, no file storage",
  },
  "/terms": {
    title: "Terms of Service | pdfToPng",
    description: "Review the terms for using the free pdfToPng file tools.",
    keywords: "pdfToPng terms of service, online file tools terms, PDF tools terms",
  },
  "/cookies": {
    title: "Cookie Policy | pdfToPng",
    description: "Learn how pdfToPng uses cookies and similar browser technologies.",
    keywords: "pdfToPng cookie policy, website cookies, browser privacy",
  },
  "/gdpr": {
    title: "GDPR Compliance | pdfToPng",
    description:
      "Learn how pdfToPng supports privacy and data protection principles under GDPR.",
    keywords: "pdfToPng GDPR, GDPR compliance, browser file privacy, data protection",
  },
  "/history": {
    title: "Conversion History | pdfToPng",
    description: "View files processed during your current browser session.",
    keywords: "pdfToPng conversion history, browser session history, file conversion history",
    noindex: true,
  },
};

const toolSeo: Record<string, { description: string; keywords: string }> = {
  "pdf-searchable-ocr": {
    description: "Turn scanned, image-only PDFs into searchable documents with selectable text directly in your browser.",
    keywords: "scanned PDF OCR, searchable PDF, PDF text recognition, OCR PDF online",
  },
  "pdf-to-png": {
    description: "Convert PDF pages into crisp PNG images with adjustable quality, processed locally in your browser.",
    keywords: "PDF to PNG, convert PDF to image, PDF page to PNG, PNG converter",
  },
  "pdf-to-png-batch": {
    description: "Convert multiple PDF files to PNG images in one batch and download the results as a ZIP archive.",
    keywords: "batch PDF to PNG, bulk PDF converter, PDF to PNG ZIP, convert multiple PDFs",
  },
  "image-to-pdf": {
    description: "Combine JPG, PNG, and other images into a single PDF document with simple browser-based processing.",
    keywords: "image to PDF, JPG to PDF, PNG to PDF, combine images into PDF",
  },
  "pdf-merge": {
    description: "Combine multiple PDF files into one organized document without uploading them to a server.",
    keywords: "merge PDF, combine PDF files, join PDFs, PDF merger online",
  },
  "pdf-split": {
    description: "Extract selected pages or page ranges from a PDF and save them as a new document in your browser.",
    keywords: "split PDF, extract PDF pages, PDF page separator, separate PDF online",
  },
  "pdf-rotate-flip": {
    description: "Rotate or flip every PDF page, or apply transformations to selected pages and ranges.",
    keywords: "rotate PDF, flip PDF, rotate PDF pages, PDF page orientation",
  },
  "pdf-reorder": {
    description: "Drag and drop PDF page thumbnails to rearrange the document into the order you need.",
    keywords: "reorder PDF pages, rearrange PDF, organize PDF pages, PDF page sorter",
  },
  "pdf-sign": {
    description: "Add a text signature to PDF documents and download the signed file directly from your browser.",
    keywords: "sign PDF, add signature to PDF, electronic PDF signature, PDF signing tool",
  },
  "pdf-watermark": {
    description: "Add customizable text or image watermarks to PDF pages with browser-based processing.",
    keywords: "PDF watermark, add watermark to PDF, image watermark PDF, text watermark PDF",
  },
  "pdf-protect": {
    description: "Encrypt and password-protect PDF documents locally before downloading the protected file.",
    keywords: "protect PDF, password protect PDF, encrypt PDF, secure PDF online",
  },
  "pptx-to-pdf": {
    description: "Convert PowerPoint PPTX presentations into PDF files directly in your browser.",
    keywords: "PPTX to PDF, PowerPoint to PDF, convert presentation to PDF, presentation converter",
  },
  "pdf-compress": {
    description: "Reduce PDF file size with adjustable compression settings while keeping your documents usable.",
    keywords: "compress PDF, reduce PDF size, shrink PDF, PDF compressor online",
  },
  "pdf-unlock": {
    description: "Remove password protection from PDFs you are authorized to access and download an unlocked copy.",
    keywords: "unlock PDF, remove PDF password, decrypt PDF, PDF password remover",
  },
  "pdf-metadata": {
    description: "View, edit, and sanitize PDF metadata such as title, author, subject, and keywords.",
    keywords: "edit PDF metadata, remove PDF metadata, PDF properties editor, sanitize PDF",
  },
  "pdf-info": {
    description: "Inspect PDF page count, file size, dimensions, version, and encryption status without uploading the file.",
    keywords: "PDF information, PDF properties, PDF page count, PDF version checker",
  },
  "pdf-page-number": {
    description: "Add page numbers to PDF documents with custom placement, formatting, and starting values.",
    keywords: "add page numbers to PDF, number PDF pages, PDF pagination, PDF page numbering",
  },
  "image-compress": {
    description: "Compress JPG, PNG, and other images by adjusting quality and reducing file size in your browser.",
    keywords: "compress image, reduce image size, image optimizer, JPG PNG compressor",
  },
  "image-upscale": {
    description: "Increase image resolution locally with browser-based upscaling for larger, clearer images.",
    keywords: "upscale image, increase image resolution, enlarge image, image upscaler",
  },
  "image-to-webp": {
    description: "Convert images to efficient WebP files for smaller web downloads and faster pages.",
    keywords: "image to WebP, convert JPG to WebP, convert PNG to WebP, WebP converter",
  },
  "image-to-jpg": {
    description: "Convert PNG, WebP, and other common image formats into compatible JPG files in your browser.",
    keywords: "image to JPG, convert PNG to JPG, JPG converter, image format converter",
  },
  "heic-to-jpg": {
    description: "Convert Apple HEIC and HEIF photos to JPG or PNG format without installing desktop software.",
    keywords: "HEIC to JPG, HEIF converter, convert iPhone photos, HEIC to PNG",
  },
  "image-ocr": {
    description: "Extract editable text from images with browser-based optical character recognition.",
    keywords: "image OCR, OCR online, extract text from image, picture to text",
  },
  "image-watermark": {
    description: "Add text or image watermarks to photos with custom positioning, size, and opacity.",
    keywords: "image watermark, add watermark to photo, photo watermark, watermark image online",
  },
  "image-to-grayscale": {
    description: "Convert color images to grayscale with a quick browser-based black-and-white effect.",
    keywords: "image grayscale, convert image to black and white, black and white photo, grayscale converter",
  },
  "remove-bg": {
    description: "Remove image backgrounds with AI processing in your browser and download transparent results.",
    keywords: "remove background, background remover, transparent background, AI image background removal",
  },
  "rotate-flip": {
    description: "Rotate or flip images horizontally and vertically with lossless browser-based transformations.",
    keywords: "rotate image, flip image, mirror image, image orientation tool",
  },
  "image-resize": {
    description: "Resize images to exact dimensions or an aspect ratio while keeping control of output quality.",
    keywords: "resize image, image resizer, change image dimensions, resize photo online",
  },
  "image-dpi": {
    description: "Change image DPI and dimensions for print-ready output without sending the image to a server.",
    keywords: "change image DPI, image resolution for printing, DPI converter, print image size",
  },
  "image-metadata": {
    description: "Inspect basic image metadata and strip metadata from images locally in your browser.",
    keywords: "image metadata viewer, remove image metadata, EXIF remover, image properties",
  },
  "image-to-base64": {
    description: "Convert images into Base64 data URIs for embedding in HTML, CSS, JSON, and web projects.",
    keywords: "image to Base64, Base64 image converter, data URI generator, embed image as Base64",
  },
  "image-to-svg": {
    description: "Wrap PNG and JPG images in scalable SVG files for convenient embedding and sharing.",
    keywords: "image to SVG, JPG to SVG, PNG to SVG, SVG image converter",
  },
  "svg-to-image": {
    description: "Convert SVG vector files into PNG or JPG images with configurable raster output.",
    keywords: "SVG to PNG, SVG to JPG, convert SVG image, SVG rasterizer",
  },
  "docx-to-pdf": {
    description: "Convert DOCX Word documents into PDF files through the available document conversion workflow.",
    keywords: "DOCX to PDF, Word to PDF, convert Word document, document converter",
  },
  "md-to-html": {
    description: "Convert Markdown files or pasted Markdown text into styled HTML with selectable themes.",
    keywords: "Markdown to HTML, MD to HTML, Markdown converter, convert Markdown file",
  },
  "md-to-docx": {
    description: "Convert Markdown files or pasted text into formatted Word DOCX documents with headings, lists, and links.",
    keywords: "Markdown to DOCX, MD to Word, Markdown Word converter, convert Markdown document",
  },
  "pdf-to-text": {
    description: "Extract selectable text from text-based PDF documents and save it for reuse or editing.",
    keywords: "PDF to text, extract text from PDF, PDF text extractor, copy PDF text",
  },
  "image-blur": {
    description: "Blur images with adjustable intensity to obscure details or create a soft visual effect.",
    keywords: "blur image, blur photo, image blur tool, pixelate or blur picture",
  },
  "url-to-qr": {
    description: "Generate a downloadable QR code from any website URL for quick sharing and access.",
    keywords: "URL to QR code, QR generator, website QR code, create QR code",
  },
  "qr-reader": {
    description: "Scan QR codes with your camera or an uploaded image to read links, text, and other encoded data.",
    keywords: "QR code reader, scan QR code, QR scanner, decode QR image",
  },
  "pdf-to-word": {
    description: "Convert text-based PDF documents into editable Microsoft Word DOCX files in your browser.",
    keywords: "PDF to Word, PDF to DOCX, convert PDF to editable Word, PDF Word converter",
  },
  "pdf-to-excel": {
    description: "Extract tabular data from PDFs and export it as editable Excel XLSX spreadsheets.",
    keywords: "PDF to Excel, PDF to XLSX, extract PDF tables, PDF spreadsheet converter",
  },
  "csv-to-json": {
    description: "Convert CSV files into clean, structured JSON data for applications, APIs, and development work.",
    keywords: "CSV to JSON, convert CSV, CSV converter, JSON data converter",
  },
  "pdf-blank-remover": {
    description: "Detect and remove blank pages from PDF documents to create a cleaner, smaller file.",
    keywords: "remove blank PDF pages, PDF blank page remover, clean PDF, delete empty PDF pages",
  },
};

const toolMetadata = Object.fromEntries(
  tools.map((tool) => [
    tool.path,
    {
      title: `${tool.name} | Free Online Tool | pdfToPng`,
      description: toolSeo[tool.id]?.description ?? tool.description,
      keywords: toolSeo[tool.id]?.keywords ?? `${tool.name}, free online ${tool.name.toLowerCase()} tool`,
    },
  ]),
);

const allPageMetadata = {
  ...pageMetadata,
  ...toolMetadata,
};

const setMeta = (
  attribute: "name" | "property",
  key: string,
  content: string,
) => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const applyMetadata = (
      metadata: Metadata,
      tool?: { name: string },
    ) => {
      const canonicalUrl = pathname === "/" ? SITE_URL : `${SITE_URL}${pathname}`;

      document.title = metadata.title;
      setMeta("name", "description", metadata.description);
      setMeta("name", "keywords", metadata.keywords);
      setMeta("name", "robots", metadata.noindex ? "noindex, nofollow" : "index, follow");
      setMeta("property", "og:title", metadata.title);
      setMeta("property", "og:description", metadata.description);
      setMeta("property", "og:type", pathname === "/" ? "website" : "article");
      setMeta("property", "og:url", canonicalUrl);
      setMeta("property", "og:site_name", SITE_NAME);
      setMeta("property", "og:image", SOCIAL_IMAGE);
      setMeta("property", "og:image:alt", "pdfToPng free PDF and image tools");
      setMeta("property", "og:locale", "en_US");
      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:title", metadata.title);
      setMeta("name", "twitter:description", metadata.description);
      setMeta("name", "twitter:image", SOCIAL_IMAGE);
      setMeta("name", "twitter:url", canonicalUrl);

      let canonical = document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;

      const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            description: DEFAULT_DESCRIPTION,
            inLanguage: "en",
          },
          {
            "@type": "SoftwareApplication",
            "@id": `${SITE_URL}/#application`,
            name: SITE_NAME,
            url: SITE_URL,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          },
          ...(tool
            ? [
                {
                  "@type": "WebApplication",
                  name: tool.name,
                  url: canonicalUrl,
                  description: metadata.description,
                  keywords: metadata.keywords,
                  applicationCategory: "UtilitiesApplication",
                  operatingSystem: "Web",
                  isPartOf: { "@id": `${SITE_URL}/#website` },
                },
              ]
            : []),
        ],
      };

      let jsonLd = document.head.querySelector<HTMLScriptElement>(
        'script[data-seo="structured-data"]',
      );
      if (!jsonLd) {
        jsonLd = document.createElement("script");
        jsonLd.type = "application/ld+json";
        jsonLd.dataset.seo = "structured-data";
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify(structuredData);
    };

    const metadata = allPageMetadata[pathname];
    const tool = tools.find((item) => item.path === pathname);

    if (metadata) {
      applyMetadata(metadata, tool);
    } else {
      applyMetadata({
        title: "Page Not Found | pdfToPng",
        description:
          "The page you requested could not be found. Explore free PDF and image tools from pdfToPng.",
        keywords: "pdfToPng, free PDF tools, free image tools",
        noindex: true,
      });
    }
  }, [pathname]);

  return null;
};

export default Seo;
