import { useEffect, useState } from "react";
import { FileText, Github, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/theme-context";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
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
          {
            cache: "no-store",
          },
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
    <nav className="fixed top-0 left-0 z-9999 w-full bg-white/50 dark:bg-gray-900/80 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-19 flex justify-between items-center">
        <a href="#home" className="group flex items-center gap-2">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <FileText className="relative w-8 h-8 text-purple-600" />
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            pdfToPng
          </span>
        </a>
        <div className="hidden lg:flex items-center space-x-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => handleDesktopNavClick(item.name)}
              className={`relative font-semibold hover:text-purple-600 py-2 px-4 rounded-xl text-lg transition-all duration-300 hover:bg-purple-100 hover:scale-105 ${
                activeSection === item.name.toLowerCase()
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {item.name}
            </a>
          ))}

          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 hover:shadow-md hover:border-slate-300 dark:hover:border-gray-600 transition-all duration-300 hover:scale-[1.02]"
          >
            <Github className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium transition-colors hidden sm:inline">
              ⭐ Star on GitHub {stars !== null && `• ${stars}`}
            </span>
          </a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* For Mobile */}
        <div className="flex lg:hidden items-center space-x-4 px-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <div
          className={`fixed inset-x-4 top-20 z-50 lg:hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl p-4 flex flex-col gap-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${isMenuOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-6 scale-95 pointer-events-none"}`}
        >
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => handleMobileNavClick(item.name)}
              className={`w-full py-3 px-4 rounded-xl text-base font-semibold text-gray-700 transition-colors duration-200 hover:bg-purple-100 hover:text-purple-600 active:scale-[0.98] ${
                activeSection === item.name.toLowerCase()
                  ? "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30"
                  : "text-slate-700 dark:text-slate-200"
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
            className="group flex mx-auto items-center gap-2 px-4 py-2.5 rounded-xl bg-white shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-colors duration-300 hover:scale-105"
          >
            <Github className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-gray-600 transition-colors">
              ⭐ {stars === null ? "..." : stars}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
