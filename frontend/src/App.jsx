import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import PdfPng from "./pages/PdfPng";
import ImageWebp from "./pages/ImageWbp";
import ImageJpg from "./pages/ImageJpg";
import RemoveBg from "./pages/RemoveBg";
import RotateFlip from "./pages/RotateFlip";
import ImageCompress from "./pages/ImageCompress";
import ImageResize from "./pages/ImageResize";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* All tools share the Layout with the Sidebar */}
      <Route element={<Layout />}>
        <Route path="/pdf-to-png" element={<PdfPng />} />
        <Route path="/image-to-webp" element={<ImageWebp />} />
        <Route path="/image-to-jpg" element={<ImageJpg />} />
        <Route path="/remove-bg" element={<RemoveBg />} />
        <Route path="/rotate-flip" element={<RotateFlip />} />
        <Route path="/image-compress" element={<ImageCompress />} />
        <Route path="/image-resize" element={<ImageResize />} />
      </Route>
    </Routes>
  );
}

export default App;
