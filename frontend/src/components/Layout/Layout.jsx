import React, { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Landing/Navbar"; // Integrated navbar
import { Menu, Home } from "lucide-react";

const Layout = ({ theme, toggleTheme }) => {
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
    // Replaced bg-gray-50 with our dynamic theme variable bg-bg-secondary
    <div className="flex h-screen bg-bg-secondary overflow-hidden transition-colors duration-300">
      
      {/* Sidebar - Pass down theme if sidebar styles need to check it */}
      <Sidebar
        activeTab={location.pathname.substring(1)}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobile={isMobile}
        onClose={closeMobileMenu}
        theme={theme}
      />

      <main className="flex-1 overflow-y-auto relative">
        
        {/* Render Navbar on desktop or landing pages, passing theme controls */}
        {!isMobile && (
          <Navbar theme={theme} toggleTheme={toggleTheme} />
        )}

        {/* Back to Home Button on specific tool pages (Desktop View) */}
        {!isLandingPage && !isMobile && (
          <button
            onClick={() => navigate("/")}
            className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(59,130,246,0.35)]"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
        )}

        {/* Mobile-specific Header view */}
        {isMobile && (
          // Replaced bg-white and shadow-sm with customizable variables
          <header className="bg-navbar-bg border-b border-border-custom sticky top-0 z-30 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 hover:bg-bg-primary rounded-lg transition-colors"
                aria-label="Open menu"
              >
                {/* Replaced text-slate-700 with theme text color */}
                <Menu className="w-6 h-6 text-text-primary" />
              </button>

              <h1 className="text-lg font-bold text-blue-600">
                pdfToPng
              </h1>

              {/* Theme Toggle Button also accessible directly in Mobile view header */}
              <button 
                onClick={toggleTheme} 
                className="p-2 text-xl cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </header>
        )}

        {/* Dynamic sub-page routes rendering section */}
        <div className="min-h-full flex justify-center items-center py-8 bg-bg-primary transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;