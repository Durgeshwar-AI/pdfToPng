import React, { lazy, Suspense } from "react";
import Navbar from "./Landing/Navbar";

const Footer = lazy(() => import("./Landing/Footer"));

// Shared wrapper for informational pages (About, legal, etc.):
// Navbar on top, a centered content column, and the site Footer.
const PageLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen theme-page font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden">
      {/* Animated Background Gradients (matches the landing page) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* pt clears the fixed Navbar (h-19) */}
      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-app-text)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-lg theme-muted leading-relaxed">
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
      <h2 className="text-xl md:text-2xl font-bold text-[var(--color-app-text)] mb-3">
        {title}
      </h2>
    )}
    <div className="space-y-3 theme-muted text-sm md:text-base leading-relaxed">
      {children}
    </div>
  </section>
);

export default PageLayout;
