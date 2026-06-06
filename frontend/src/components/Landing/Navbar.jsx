import React, { useEffect, useState } from "react";
import { FileText, Github, Menu, X, Sun, Moon } from "lucide-react";

const Navbar = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [stars, setStars] = useState(null);

  const navItems = [
    { name: "Home", link: "#home" },
    { name: "Feature", link: "#feature" },
    { name: "Tools", link: "#tools" },
    { name: "Privacy", link: "#privacy" },
  ];

  useEffect(() => {
    const fetchGithubStars = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/Durgeshwar-AI/pdfToPng",
          { cache: "no-store" }
        );
        const data = await response.json();
        setStars(data.stargazers_count);
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      }
    };

    fetchGithubStars();
  }, []);

  const handleMobileNavClick = (itemName) => {
    setActiveSection(itemName.toLowerCase());
    setIsMenuOpen(false);
  };

  const handleDesktopNavClick = (itemName) => {
    setActiveSection(itemName.toLowerCase());
  };

  return (
    // Updated: Uses bg-navbar-bg and border-border-custom with backdrop blurring
    <nav className="fixed top-0 left-0 z-[9999] w-full bg-navbar-bg/70 backdrop-blur border-b border-border-custom shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-19 flex justify-between items-center">
        
        {/* Logo / Brand */}
        <a href="#home" className="group flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <FileText className="relative w-8 h-8 text-purple-600" />
          </div>
          {/* Updated: Swapped text-slate-900 to text-text-primary */}
          <span className="text-2xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            pdfToPng
          </span>
        </a>

        {/* Desktop Navigation Link Cluster */}
        <div className="hidden lg:flex items-center space-x-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => handleDesktopNavClick(item.name)}
              // Updated: Handles dynamic link colors using theme extensions
              className={`relative font-semibold hover:text-purple-600 py-2 px-4 rounded-xl text-lg transition-all duration-300 hover:bg-purple-100/20 hover:scale-105 ${
                activeSection === item.name.toLowerCase()
                  ? "text-purple-600"
                  : "text-text-secondary"
              }`}
            >
              {item.name}
            </a>
          ))}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border-custom bg-card-bg text-text-primary hover:bg-bg-secondary transition-all duration-300 cursor-pointer shadow-sm hover:scale-105"
            aria-label="Toggle display mode"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-slate-600" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>

          {/* GitHub Repository Star Action Badge */}
          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card-bg shadow-sm border border-border-custom hover:shadow-md hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02]"
          >
            <Github className="w-5 h-5 text-text-secondary group-hover:text-purple-600 transition-colors" />
            <span className="text-text-secondary group-hover:text-text-primary font-medium transition-colors hidden sm:inline">
              Star on GitHub {stars !== null && `• ${stars}`}
            </span>
          </a>
        </div>

        {/* Mobile Hamburguer Trigger actions */}
        <div className="flex lg:hidden items-center space-x-4 px-2">
          {/* Inline Theme Switcher button for narrower screens */}
          <button
            onClick={toggleTheme}
            className="p-2 text-text-primary rounded-lg border border-border-custom"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="text-text-primary p-1"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Dropdown Panel Drawer */}
        <div
          className={`fixed inset-x-4 top-20 z-50 lg:hidden rounded-2xl border border-border-custom bg-navbar-bg/95 backdrop-blur-md shadow-2xl p-4 flex flex-col gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
            isMenuOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-6 scale-95 pointer-events-none"
          }`}
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => handleMobileNavClick(item.name)}
              className={`w-full py-3 px-4 rounded-xl text-base font-semibold transition-colors duration-200 hover:bg-purple-100/20 hover:text-purple-600 active:scale-[0.98] ${
                activeSection === item.name.toLowerCase()
                  ? "text-purple-600 bg-purple-100/20"
                  : "text-text-secondary"
              }`}
            >
              {item.name}
            </a>
          ))}

          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng"
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository"
            className="group flex mx-auto items-center gap-2 px-4 py-2.5 rounded-xl bg-card-bg shadow-sm border border-border-custom hover:border-purple-400/50 transition-colors duration-300"
          >
            <Github className="w-5 h-5 text-text-secondary group-hover:text-purple-600 transition-colors" />
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-bg-secondary text-text-primary">
              ⭐ {stars === null ? "..." : stars}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;