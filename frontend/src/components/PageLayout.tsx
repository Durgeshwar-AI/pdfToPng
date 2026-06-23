import React, { lazy, Suspense } from "react";
import Navbar from "./Landing/Navbar";

const Footer = lazy(() => import("./Landing/Footer"));

// Shared wrapper for informational pages (About, legal, etc.):
// Navbar on top, a centered content column, and the site Footer.
const PageLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen dark:bg-slate-900 transition-colors duration-300 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* Animated Background Gradients (matches the landing page) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-72 h-72 dark:bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-72 h-72 dark:bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* pt clears the fixed Navbar (h-19) */}
      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-lg dark:text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </header>

          {children}
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

// Reusable content section so every page shares the same heading rhythm.
export const Section = ({ title, children }) => (
  <section className="mb-8">
    {title && (
      <h2 className="text-xl md:text-2xl font-bold dark:text-slate-100 mb-3">
        {title}
      </h2>
    )}
    <div className="space-y-3 dark:text-slate-400 text-sm md:text-base leading-relaxed">
      {children}
    </div>
  </section>
);

export default PageLayout;
