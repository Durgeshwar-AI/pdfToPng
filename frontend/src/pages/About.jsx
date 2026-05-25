import { Github, ShieldCheck, Layers3 } from "lucide-react";

const About = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <section className="rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-700 px-6 sm:px-10 py-12 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300 mb-4">
            About this project
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Built for fast, private file conversions
          </h1>
          <p className="max-w-3xl text-slate-300 text-lg leading-8">
            pdfToPng is an open source collection of file tools for everyday PDF
            and image workflows. The project focuses on local processing, a
            clean interface, and lightweight features that are easy to extend
            and contribute to.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 p-6 sm:p-10">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Privacy-first
            </h2>
            <p className="text-slate-600 leading-7">
              Files are processed in memory for the current request and are not
              stored on the backend.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <Layers3 className="w-10 h-10 text-blue-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Modular</h2>
            <p className="text-slate-600 leading-7">
              The app is split into reusable React pages and Flask blueprints so
              new tools can be added cleanly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <Github className="w-10 h-10 text-slate-900 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Open source
            </h2>
            <p className="text-slate-600 leading-7">
              Feedback, bugs, and feature requests belong in GitHub Issues so
              contributors can track progress publicly.
            </p>
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Have an idea or found a problem? Open an issue and include the tool
            name, expected result, and a sample file if possible.
          </p>
          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng/issues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-transform hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
            Report Issue
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
