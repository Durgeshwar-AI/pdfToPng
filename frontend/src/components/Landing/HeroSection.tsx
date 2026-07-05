import React from "react";
import { Shield, Globe, ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="max-w-6xl mx-auto px-6 pt-30 pb-24 text-center"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 mb-8 animate-fade-in-up">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Privacy-First — Files Are Not Stored
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 animate-fade-in-up animation-delay-200">
        <span className="text-slate-900 dark:text-white">Local & Private</span>
        <br />
        <span className="bg-linear-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
          File Tools
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
        Convert, optimize, and edit your files with privacy as a priority. Tools
        run locally when possible; for operations that require a server, files
        are sent only transiently and are not stored.
        <span className="block text-lg text-slate-500 mt-2 font-medium">
          No storage. No data leaks. Fast, private tools.
        </span>
      </p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-5 animate-fade-in-up animation-delay-600">
        <a
          href="#tools"
          className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600" />
          <div className="relative flex items-center gap-2 text-white">
            Explore Tools{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm border border-slate-200 dark:border-gray-700 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="font-medium">
            Free • No Signup Required • Unlimited
          </span>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
        {[
          "No persistent storage",
          "Client-side by default",
          "Open source & auditable",
        ].map((text, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
