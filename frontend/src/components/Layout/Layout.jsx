import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
<<<<<<< HEAD
import PdfPng from "../../pages/PdfPng";
import ImageWebp from "../../pages/ImageWbp";
import ImageJpg from "../../pages/ImageJpg";
import RemoveBg from "../../pages/RemoveBg";
import ImageUpscale from "../../pages/ImageUpscale";
=======
import { Outlet, useLocation } from "react-router-dom";
>>>>>>> upstream/main
import { Menu } from "lucide-react";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const location = useLocation();
  const activePath = location.pathname.substring(1); 

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

<<<<<<< HEAD
  const renderContent = () => {
    switch (activeTab) {
      case "pdf-to-png":
        return <PdfPng />;
      case "image-to-webp":
        return <ImageWebp />;
      case "image-to-jpg":
        return <ImageJpg />;
      case "remove-bg":
        return <RemoveBg />;
      case "image-upscale":
        return <ImageUpscale />;
      default:
        return <PdfPng />;
    }
  };

=======
>>>>>>> upstream/main
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeTab={activePath}
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
              <h1 className="text-lg font-semibold text-blue-400">
                pdfToPng
              </h1>
              <div className="w-10"></div>
            </div>
          </header>
        )}
        {/* Content Area */}
        <div className="min-h-full flex justify-center items-center py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;