import React, { lazy, Suspense } from 'react';
import Navbar from './Landing/Navbar';

const Footer = lazy(() => import('./Landing/Footer'));

// Shared wrapper for informational pages (About, legal, etc.):
// Navbar on top, a centered content column, and the site Footer.
const PageLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen overflow-x-hidden font-sans transition-colors duration-300 selection:bg-purple-100 selection:text-purple-900 dark:bg-slate-900">
      {/* Animated Background Gradients (matches the landing page) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 -left-40 h-72 w-72 rounded-full blur-3xl dark:bg-purple-900/20" />
        <div className="absolute -right-40 bottom-0 h-72 w-72 rounded-full blur-3xl dark:bg-blue-900/20" />
      </div>

      <Navbar />

      {/* pt clears the fixed Navbar (h-19) */}
      <main className="relative z-10 pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <header className="mb-10">
            <h1 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl dark:from-slate-100 dark:to-slate-300">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-lg leading-relaxed dark:text-slate-400">{subtitle}</p>
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
    {title && <h2 className="mb-3 text-xl font-bold md:text-2xl dark:text-slate-100">{title}</h2>}
    <div className="space-y-3 text-sm leading-relaxed md:text-base dark:text-slate-400">
      {children}
    </div>
  </section>
);

export default PageLayout;
