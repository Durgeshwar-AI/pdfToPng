import React from 'react';
import { Globe, Star } from 'lucide-react';

const TrustBanner = () => {
  return (
    <section id="privacy" className="mx-auto max-w-5xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-12 dark:border-slate-700 dark:bg-slate-900">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-purple-100 blur-[80px] dark:bg-purple-900" />
        <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-blue-100 blur-[80px] dark:bg-blue-900" />

        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-bold tracking-wide text-emerald-600 uppercase">
                Privacy-First Processing
              </span>
            </div>
            <h3 className="mb-2 text-2xl font-extrabold text-slate-900 md:text-3xl dark:text-white">
              Your privacy is our priority
            </h3>
            <p className="font-medium text-slate-600 dark:text-slate-400">
              Open source, auditable, and designed to avoid persistent storage of your files.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="ml-2 text-lg font-extrabold text-slate-900 dark:text-white">4.9</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">/5</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
