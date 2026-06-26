import React from 'react';
import { Link } from 'react-router-dom';
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
  Instagram,
} from 'lucide-react';
import { SiX } from 'react-icons/si';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="group flex items-center gap-2">
              <div className="rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 p-2 transition-all duration-300 group-hover:shadow-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent dark:from-slate-100 dark:to-slate-300">
                pdfToPng
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-600">
              Convert PDF pages to high-quality PNG images instantly. Free, secure, and
              privacy-focused.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://github.com/Durgeshwar-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg bg-slate-100 p-2 transition-all duration-300 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/40"
              >
                <Github className="h-4 w-4 text-slate-600 group-hover:text-purple-600 dark:text-slate-300" />
              </a>
              <a
                href={import.meta.env.VITE_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg bg-slate-100 p-2 transition-all duration-300 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/40"
              >
                <Linkedin className="h-4 w-4 text-slate-600 group-hover:text-purple-600 dark:text-slate-300" />
              </a>
              <a
                href={`mailto:${import.meta.env.VITE_EMAIL}`}
                className="group rounded-lg bg-slate-100 p-2 transition-all duration-300 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/40"
              >
                <Mail className="h-4 w-4 text-slate-600 group-hover:text-purple-600 dark:text-slate-300" />
              </a>
              <a
                href={import.meta.env.VITE_TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="group rounded-lg bg-slate-100 p-2 transition-all duration-300 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/40"
              >
                <SiX className="h-4 w-4 text-slate-600 group-hover:text-purple-600 dark:text-slate-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="relative mb-4 inline-block text-lg font-semibold text-slate-900 dark:text-slate-100">
              Quick Links
              <div className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-purple-600"></div>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                // These sections already live on the landing page.
                { name: 'How it Works', path: '/#tools', hash: true },
                { name: 'Features', path: '/#feature', hash: true },
              ].map(item => {
                const linkClass =
                  'text-slate-500 hover:text-purple-600 transition-all duration-300 text-sm flex items-center gap-2 group';
                const dot = (
                  <span className="h-1 w-0 rounded-full bg-purple-600 transition-all duration-300 group-hover:w-1"></span>
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
            <h3 className="relative mb-4 inline-block text-lg font-semibold text-slate-900 dark:text-slate-100">
              Legal
              <div className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-purple-600"></div>
            </h3>
            <ul className="mb-6 space-y-3">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Cookie Policy', path: '/cookies' },
                { name: 'GDPR Compliance', path: '/gdpr' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="group flex items-center gap-2 text-sm text-slate-500 transition-all duration-300 hover:text-purple-600"
                  >
                    <span className="h-1 w-0 rounded-full bg-purple-600 transition-all duration-300 group-hover:w-1"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100 dark:placeholder-slate-500"
                />
                <button className="rounded-lg bg-purple-600 px-3 py-2 text-sm text-white transition-all duration-300 hover:bg-purple-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            {/* Privacy Notice */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Lock className="h-3.5 w-3.5 text-green-600" />
                <span className="font-medium">Zero Storage</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Shield className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-medium">SSL Encrypted</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Globe className="h-3.5 w-3.5 text-purple-600" />
                <span className="font-medium">100% Free</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>© {currentYear} pdfToPng</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3.5 w-3.5 animate-pulse text-red-500" />
                for the dev community
              </span>
            </div>
          </div>
        </div>

        {/* Additional Tech Stack Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 pt-4">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-gray-700 dark:text-slate-400">
            React
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-gray-700 dark:text-slate-400">
            Tailwind CSS
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-gray-700 dark:text-slate-400">
            Vite
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-gray-700 dark:text-slate-400">
            PDF.js
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
