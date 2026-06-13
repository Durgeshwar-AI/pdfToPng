import React from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Lock, 
  Github, 
  Linkedin, 
  Mail, 
  Heart,
  Shield,
  Globe,
  Facebook,
  Instagram
} from "lucide-react";
import { SiX } from "react-icons/si";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 border-t border-slate-200 dark:border-gray-700">
      
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl group-hover:shadow-lg transition-all duration-300">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                pdfToPng
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              Convert PDF pages to high-quality PNG images instantly. 
              Free, secure, and privacy-focused.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://github.com/Durgeshwar-AI" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all duration-300 group">
                <Github className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-purple-600" />
              </a>
              <a href={import.meta.env.VITE_LINKEDIN_URL} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all duration-300 group">
                <Linkedin className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-purple-600" />
              </a>
              <a href={`mailto:${import.meta.env.VITE_EMAIL}`}
                 className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all duration-300 group">
                <Mail className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-purple-600" />
              </a>
              <a href={import.meta.env.VITE_TWITTER_URL} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 aria-label="X (formerly Twitter)"
                 className="p-2 bg-slate-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all duration-300 group">
                 <SiX className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-purple-600" />
                 </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-lg relative inline-block">
              Quick Links
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-purple-600 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                // These sections already live on the landing page.
                { name: "How it Works", path: "/#tools", hash: true },
                { name: "Features", path: "/#feature", hash: true },
              ].map((item) => {
                const linkClass =
                  "text-slate-500 hover:text-purple-600 transition-all duration-300 text-sm flex items-center gap-2 group";
                const dot = (
                  <span className="w-0 group-hover:w-1 h-1 bg-purple-600 rounded-full transition-all duration-300"></span>
                );
                return (
                  <li key={item.name}>
                    {item.hash ? (
                      <a href={item.path} className={linkClass}>
                        {dot}
                        {item.name}
                      </a>
                    ) : (
                      <Link to={item.path} className={linkClass}>
                        {dot}
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Legal & Connect */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-lg relative inline-block">
              Legal
              <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-purple-600 rounded-full"></div>
            </h3>
            <ul className="space-y-3 mb-6">
              {[
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Cookie Policy", path: "/cookies" },
                { name: "GDPR Compliance", path: "/gdpr" },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="text-slate-500 hover:text-purple-600 transition-all duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-purple-600 rounded-full transition-all duration-300"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Stay Updated</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            
            {/* Privacy Notice */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                <span className="font-medium">Zero Storage</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">SSL Encrypted</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium">100% Free</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>© {currentYear} pdfToPng</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" /> 
                for the dev community
              </span>
            </div>
          </div>
        </div>

        {/* Additional Tech Stack Badges */}
        <div className="mt-6 pt-4 flex flex-wrap justify-center gap-3">
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400 rounded-full">React</span>
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400 rounded-full">Tailwind CSS</span>
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400 rounded-full">Vite</span>
          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400 rounded-full">PDF.js</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;