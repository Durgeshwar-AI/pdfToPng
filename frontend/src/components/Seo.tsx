import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import tools from "../data/toolsData";

const SITE_URL = "https://pdftopng.vercel.app";
const SITE_NAME = "pdfToPng";
const DEFAULT_TITLE = "Free PDF & Image Tools Online | pdfToPng";
const DEFAULT_DESCRIPTION =
  "Free online PDF and image tools that prioritize privacy. Convert, compress, merge, resize, and edit files in your browser with no signup.";
const SOCIAL_IMAGE = `${SITE_URL}/og-image.svg`;

const pageMetadata: Record<
  string,
  { title: string; description: string; noindex?: boolean }
> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/about": {
    title: "About pdfToPng | Private Online File Tools",
    description:
      "Learn how pdfToPng provides free PDF and image tools with browser-first processing, no signup, and no persistent file storage.",
  },
  "/privacy": {
    title: "Privacy Policy | pdfToPng",
    description:
      "Read the pdfToPng privacy policy and learn how files are processed without persistent storage.",
  },
  "/terms": {
    title: "Terms of Service | pdfToPng",
    description: "Review the terms for using the free pdfToPng file tools.",
  },
  "/cookies": {
    title: "Cookie Policy | pdfToPng",
    description: "Learn how pdfToPng uses cookies and similar browser technologies.",
  },
  "/gdpr": {
    title: "GDPR Compliance | pdfToPng",
    description:
      "Learn how pdfToPng supports privacy and data protection principles under GDPR.",
  },
  "/history": {
    title: "Conversion History | pdfToPng",
    description: "View files processed during your current browser session.",
    noindex: true,
  },
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
    const tool = tools.find((item) => item.path === pathname);
    const metadata = pageMetadata[pathname] ??
      (tool
        ? {
            title: `${tool.name} | Free Online Tool | pdfToPng`,
            description: `${tool.description} Free to use, privacy-focused, and designed for fast browser-based file processing.`,
          }
        : {
            title: "Page Not Found | pdfToPng",
            description:
              "The page you requested could not be found. Explore free PDF and image tools from pdfToPng.",
            noindex: true,
          });
    const canonicalUrl = pathname === "/" ? SITE_URL : `${SITE_URL}${pathname}`;

    document.title = metadata.title;
    setMeta("name", "description", metadata.description);
    setMeta("name", "robots", metadata.noindex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("property", "og:type", pathname === "/" ? "website" : "article");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", SOCIAL_IMAGE);
    setMeta("property", "og:image:alt", "pdfToPng free PDF and image tools");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);
    setMeta("name", "twitter:image", SOCIAL_IMAGE);

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
  }, [pathname]);

  return null;
};

export default Seo;
