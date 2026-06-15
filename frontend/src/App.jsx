import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import "./App.css";
import ScrollToTop from "./components/ScrollToTop";

import Layout from "./components/Layout/Layout";
import ErrorBoundary from "./ErrorBoundary";

const UrlToQr = lazy(() => import("./pages/UrlToQr"));

const PdfMerge = lazy(() => import("./pages/PdfMerge"));
const PdfSign = lazy(() => import("./pages/PdfSign"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ImagePdf = lazy(() => import("./pages/ImagePdf"));
const PdfPng = lazy(() => import("./pages/PdfPng"));
const PdfDocx = lazy(() => import("./pages/PdfDocx"));
const ImageWbp = lazy(() => import("./pages/ImageWbp"));
const ImageJpg = lazy(() => import("./pages/ImageJpg"));
const RemoveBg = lazy(() => import("./pages/RemoveBg"));
const RotateFlip = lazy(() => import("./pages/RotateFlip"));
const ImageCompress = lazy(() => import("./pages/ImageCompress"));
const ImageResize = lazy(() => import("./pages/ImageResize"));
const ImageUpscale = lazy(() => import("./pages/ImageUpscale"));
const ImageDpi = lazy(() => import("./pages/ImageDpi"));
const ImageGrayScale = lazy(() => import("./pages/ImageGrayScale"));
const ImageMetadata = lazy(() => import("./pages/ImageMetadata"));
const ImageBase64 = lazy(() => import("./pages/ImageBase64"));
const ImageToSVG = lazy(() => import("./pages/ImageToSVG"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DocxPdf = lazy(() => import("./pages/DocxPdf"));
const PdfSplit = lazy(() => import("./pages/PdfSplit"));
const PdfRotateFlip = lazy(() => import("./pages/PdfRotateFlip"));
const PDFWatermark = lazy(() => import("./pages/PDFWatermark"));
const ImageOCR = lazy(() => import("./pages/ImageOCR"));
const ImageWatermark = lazy(() => import("./pages/ImageWatermark"));
const BlurImage = lazy(()=> import("./pages/BlurImage"))
const MdToHtml = lazy(()=> import("./pages/MdToHtml"))
const PdfProtect = lazy(() => import("./pages/PdfProtect"));
const PdfCompress = lazy(() => import("./pages/PdfCompress"));
const PdfUnlock = lazy(() => import("./pages/PdfUnlock"));
const PdfMetadata = lazy(() => import("./pages/PdfMetadata"));
const PdfToText = lazy(() => import("./pages/PdfToText"));
const PdfInfo = lazy(() => import("./pages/PdfInfo"));

// Informational pages (linked from the footer)
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Gdpr = lazy(() => import("./pages/Gdpr"));

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* The Landing Page has its own clean view */}
          <Route path="/" element={<LandingPage />} />

          {/* Informational pages (Navbar + Footer wrapper, no tool sidebar) */}
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/gdpr" element={<Gdpr />} />

          {/* All application tools share the Layout with the Sidebar */}
          <Route element={<Layout />}>
            <Route path="/pdf-to-png" element={<PdfPng />} />
            <Route path="/pdf-to-word" element={<PdfDocx />} />
            <Route path="/docx-to-pdf" element={<DocxPdf />} />
            <Route path="/image-to-pdf" element={<ImagePdf />} />
            <Route path="/pdf-merge" element={<PdfMerge />} />
            <Route path="/pdf-split" element={<PdfSplit />} />
            <Route path="/pdf-rotate-flip" element={<PdfRotateFlip />} />
            <Route path="/pdf-sign" element={<PdfSign />} />
            <Route path="/pdf-watermark" element={<PDFWatermark />} />
            <Route path="/pdf-protect" element={<PdfProtect />} />
            <Route path="/pdf-compress" element={<PdfCompress />} />
            <Route path="/pdf-unlock" element={<PdfUnlock />} />
            <Route path="/pdf-metadata" element={<PdfMetadata />} />
            <Route path="/pdf-to-text" element={<PdfToText />} />
            <Route path="/pdf-info" element={<PdfInfo />} />

            <Route path="/image-blur" element={<BlurImage />} />
            <Route path="/image-to-webp" element={<ImageWbp />} />
            <Route path="/image-to-jpg" element={<ImageJpg />} />
            <Route path="/image-ocr" element={<ImageOCR />} />
            <Route path="/image-watermark" element={<ImageWatermark />} />
            <Route path="/image-to-svg" element={<ImageToSVG />} />
            <Route path="/image-to-grayscale" element={<ImageGrayScale />} />
            <Route path="/remove-bg" element={<RemoveBg />} />
            <Route path="/rotate-flip" element={<RotateFlip />} />
            <Route path="/image-compress" element={<ImageCompress />} />
            <Route path="/image-resize" element={<ImageResize />} />
            <Route path="/image-upscale" element={<ImageUpscale />} />
            <Route path="/image-dpi" element={<ImageDpi />} />
            <Route path="/image-metadata" element={<ImageMetadata />} />
            <Route path="/image-to-base64" element={<ImageBase64 />} />
            <Route path="/md-to-html" element={<MdToHtml />} />
            <Route path="/url-to-qr" element={<UrlToQr />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;