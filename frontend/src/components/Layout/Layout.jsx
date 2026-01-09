import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import PdfPng from "../../pages/PdfPng";
import ImageWebp from "../../pages/ImageWbp";
import RemoveBg from "../../pages/RemoveBg";
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
      case "remove-bg":
        return <RemoveBg />;
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
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-blue-400">FileConverter</h1>
              <div className="w-10"></div> {/* Spacer for alignment */}
            </div>
          </header>
        )}

        {/* Content Area */}
        <div className="min-h-full flex justify-center items-center">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Layout;
