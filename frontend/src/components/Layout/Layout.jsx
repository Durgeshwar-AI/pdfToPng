import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import PdfPng from "../../pages/PdfPng";
import ImageWebp from "../../pages/ImageWbp";
import ImageJpg from "../../pages/ImageJpg";
import ImageGrayscale from "../../pages/ImageGrayscale";
import RemoveBg from "../../pages/RemoveBg";
import ImageCompress from "../../pages/ImageCompress";
import RotateFlip from "../../pages/RotateFlip";
import { Menu } from "lucide-react";

const Layout = () => {
  const [activeTab, setActiveTab] = useState("pdf-to-png");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "pdf-to-png":
        return <PdfPng />;
      case "image-to-webp":
        return <ImageWebp />;
      case "image-to-jpg":
        return <ImageJpg />;
      case "image-to-grayscale":
        return <ImageGrayscale />;
      case "remove-bg":
        return <RemoveBg />;
      case "image-compress":
        return <ImageCompress />;
      case "rotate-flip":
        return <RotateFlip />;
      default:
        return <PdfPng />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobile={isMobile}
        onClose={closeMobileMenu}
      />
      <main className="flex-1 overflow-y-auto">
        {isMobile && (
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-blue-400">
                FileConverter
              </h1>
              <div className="w-10"></div>
            </div>
          </header>
        )}

        <div className="min-h-full flex justify-center items-center">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Layout;