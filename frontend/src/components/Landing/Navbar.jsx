import { useEffect, useState } from 'react';
import { FileText, Github, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/theme-context';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [stars, setStars] = useState(null);
  const location = useLocation();
  const navItems = [
    { name: 'Home', hash: 'home' },
    { name: 'Feature', hash: 'feature' },
    { name: 'Tools', hash: 'tools' },
    { name: 'Privacy', path: '/privacy' },
  ];

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        setActiveSection(id);
      }
    }
  }, [location]);

  useEffect(() => {
    const fetchGithubStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/Durgeshwar-AI/pdfToPng', {
          cache: 'no-store',
        });

        const data = await response.json();

        setStars(data.stargazers_count);
      } catch (error) {
        console.error('Error fetching GitHub stars:', error);
      }
    };

    fetchGithubStars();
  }, []);

  const handleMobileNavClick = itemName => {
    setActiveSection(itemName.toLowerCase());
    setIsMenuOpen(false);
  };

  const handleDesktopNavClick = itemName => {
    setActiveSection(itemName.toLowerCase());
  };

  return (
    <nav className="fixed top-0 left-0 z-9999 w-full border-b border-transparent bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-6">
        <Link to="/#home" className="group flex items-center gap-2">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 opacity-40 blur-lg transition-opacity group-hover:opacity-60 dark:opacity-60 dark:group-hover:opacity-80" />
            <FileText className="relative h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-slate-100 dark:to-slate-300">
            pdfToPng
          </span>
        </Link>
        <div className="hidden items-center space-x-6 lg:flex">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path || `/#${item.hash}`}
              onClick={() => handleDesktopNavClick(item.name)}
              className={`relative rounded-xl px-4 py-2 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-purple-100 hover:text-purple-600 ${
                activeSection === item.name.toLowerCase()
                  ? 'text-purple-600 dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {item.name}
            </Link>
          ))}

          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
          >
            <Github className="h-5 w-5 text-slate-600 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white" />
            <span className="hidden font-medium text-slate-600 transition-colors group-hover:text-slate-900 sm:inline dark:text-slate-300 dark:group-hover:text-white">
              ⭐ Star on GitHub {stars !== null && `• ${stars}`}
            </span>
          </a>
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* For Mobile */}
        <div className="flex items-center space-x-3 px-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="text-slate-700 dark:text-slate-200"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <div
          className={`fixed inset-x-4 top-20 z-50 flex transform flex-col gap-2 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden dark:border-slate-700 dark:bg-slate-900/95 ${isMenuOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-6 scale-95 opacity-0'}`}
        >
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path || `/#${item.hash}`}
              onClick={() => handleMobileNavClick(item.name)}
              className={`w-full rounded-xl px-4 py-3 text-base font-semibold transition-colors duration-200 hover:bg-purple-100 hover:text-purple-600 active:scale-[0.98] dark:hover:bg-purple-950 ${
                activeSection === item.name.toLowerCase()
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {item.name}
            </Link>
          ))}

          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng"
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository"
            className="group mx-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-colors duration-300 hover:scale-105 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
          >
            <Github className="h-5 w-5 text-slate-600 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white" />
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 transition-colors group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-slate-700">
              ⭐ {stars === null ? '...' : stars}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
