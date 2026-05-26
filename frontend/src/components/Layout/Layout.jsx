import React, { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { Menu } from "lucide-react";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const location = useLocation();

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

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activeTab={location.pathname.substring(1)}
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
        aria-label="Open navigation menu"
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="text-lg font-semibold text-blue-700">
        pdfToPng
      </h1>

      <div className="w-10" />
    </div>
  </header>
)}

        <div className="min-h-full flex justify-center items-center py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
