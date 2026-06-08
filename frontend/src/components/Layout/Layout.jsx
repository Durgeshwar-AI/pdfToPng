import React, { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { Menu, Sun, Moon, Home } from "lucide-react";
import { useTheme } from "../../context/theme-context";

const Layout = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
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
  const isLandingPage = location.pathname === "/";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        activeTab={location.pathname.substring(1)}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobile={isMobile}
        onClose={closeMobileMenu}
      />
      <main className="flex-1 overflow-y-auto relative">
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {!isLandingPage && (
          <button
            onClick={() => navigate("/")}
            className="fixed top-4 right-16 z-40 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)]"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
        )}

        {isMobile && (
          <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
              <h1 className="text-lg font-bold text-blue-600">pdfToPng</h1>
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
