import {
  FileText,
  Image,
  Shield,
  Sparkles,
  ScanSearch,
  Github,
} from "lucide-react";

const featureItems = [
  {
    icon: FileText,
    title: "PDF tools",
    description:
      "Convert PDFs to PNG, merge files, and sign documents from the browser.",
  },
  {
    icon: Image,
    title: "Image conversions",
    description:
      "Turn images into WebP, JPG, SVG, PDF, or Base64 with a few clicks.",
  },
  {
    icon: Sparkles,
    title: "Enhancement tools",
    description:
      "Compress, resize, upscale, rotate, flip, and adjust DPI settings.",
  },
  {
    icon: ScanSearch,
    title: "Metadata utilities",
    description:
      "Inspect, copy, or strip image metadata when you need a clean export.",
  },
  {
    icon: Shield,
    title: "Privacy-minded flow",
    description:
      "Keep file handling local-first and temporary whenever the workflow allows it.",
  },
];

const Features = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <section className="rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 sm:px-10 py-12 border-b border-slate-200 bg-linear-to-br from-blue-50 via-white to-emerald-50">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-600 mb-4">
            Features
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Everything the site can do in one place
          </h1>
          <p className="max-w-3xl text-lg text-slate-600 leading-8">
            The frontend groups the project’s tools into focused pages so users
            can quickly find the right conversion or optimization workflow.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 p-6 sm:p-10">
          {featureItems.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-lg shadow-slate-900/15">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h2>
                <p className="text-slate-600 leading-7">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="px-6 sm:px-10 pb-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Want a new tool or workflow? Open an issue with the use case and the
            expected input/output format.
          </p>
          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng/issues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
            Request a Feature
          </a>
        </div>
      </section>
    </div>
  );
};

export default Features;
