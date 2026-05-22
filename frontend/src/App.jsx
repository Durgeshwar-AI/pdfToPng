import { Routes, Route } from "react-router-dom";
import "./App.css";

import PdfMerge from "./pages/PdfMerge";
import PdfSign from "./pages/PdfSign";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import ImagePdf from "./pages/ImagePdf";
import PdfPng from "./pages/PdfPng";
import PdfDocx from "./pages/PdfDocx";
import ImageWebp from "./pages/ImageWbp";
import ImageJpg from "./pages/ImageJpg";
import RemoveBg from "./pages/RemoveBg";
import RotateFlip from "./pages/RotateFlip";
import ImageCompress from "./pages/ImageCompress";
import ImageResize from "./pages/ImageResize";
import ImageUpscale from "./pages/ImageUpscale";
import ImageDpi from "./pages/ImageDpi";
import ImageGrayScale from "./pages/ImageGrayScale";
import ImageMetadata from "./pages/ImageMetadata";
import ImageBase64 from "./pages/ImageBase64";
import NotFound from './pages/NotFound';
import ErrorBoundary from "./ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* The Landing Page has its own clean view */}
        <Route path="/" element={<LandingPage />} />

        {/* All application tools share the Layout with the Sidebar */}
        <Route element={<Layout />}>
          <Route path="/pdf-to-png" element={<PdfPng />} />
          <Route path="/pdf-to-word" element={<PdfDocx />} />
          <Route path="/image-to-pdf" element={<ImagePdf />} />
          <Route path="/pdf-merge" element={<PdfMerge />} />
          <Route path="/pdf-sign" element={<PdfSign />} />
          
          <Route path="/image-to-webp" element={<ImageWebp />} />
          <Route path="/image-to-jpg" element={<ImageJpg />} />
          <Route path="/image-to-grayscale" element={<ImageGrayScale />} />
          <Route path="/remove-bg" element={<RemoveBg />} />
          <Route path="/rotate-flip" element={<RotateFlip />} />
          <Route path="/image-compress" element={<ImageCompress />} />
          <Route path="/image-resize" element={<ImageResize />} />
          <Route path="/image-upscale" element={<ImageUpscale />} />
          <Route path="/image-dpi" element={<ImageDpi />} />
          <Route path="/image-metadata" element={<ImageMetadata />} />
          <Route path="/image-to-base64" element={<ImageBase64 />} />
          
          {/* Catch-all route placed precisely at the bottom of the layout block */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App; 