import React from 'react';
import { Shield, Globe, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="mx-auto max-w-6xl px-6 pt-30 pb-24 text-center">
      <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Shield className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Privacy-First — Files Are Not Stored
        </span>
      </div>

      <h1 className="animate-fade-in-up animation-delay-200 mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl">
        <span className="text-slate-900 dark:text-white">Local & Private</span>
        <br />
        <span className="bg-linear-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
          File Tools
        </span>
      </h1>

      <p className="animate-fade-in-up animation-delay-400 mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl dark:text-slate-300">
        Convert, optimize, and edit your files with privacy as a priority. Tools run locally when
        possible; for operations that require a server, files are sent only transiently and are not
        stored.
        <span className="mt-2 block text-lg font-medium text-slate-500">
          No storage. No data leaks. Fast, private tools.
        </span>
      </p>

      <div className="animate-fade-in-up animation-delay-600 flex flex-col items-center justify-center gap-5 sm:flex-row">
        <a
          href="#tools"
          className="group relative overflow-hidden rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600" />
          <div className="relative flex items-center gap-2 text-white">
            Explore Tools{' '}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </a>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-slate-300">
          <Globe className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Free • No Signup Required • Unlimited</span>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
        {['No persistent storage', 'Client-side by default', 'Open source & auditable'].map(
          (text, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>{text}</span>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default HeroSection;
