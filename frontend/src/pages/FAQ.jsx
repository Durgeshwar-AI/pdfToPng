import { HelpCircle, Github } from "lucide-react";

const faqItems = [
  {
    question: "Are my files stored on the server?",
    answer:
      "No. The project is designed to process files in memory for the current request only and not retain them afterward.",
  },
  {
    question: "What should I do if a conversion fails?",
    answer:
      "Check the file type, try a smaller test file, and then open a GitHub issue with the tool name and error message.",
  },
  {
    question: "Can I suggest a new tool or improvement?",
    answer:
      "Yes. GitHub Issues is the best place to share feature requests, screenshots, or examples of the workflow you want.",
  },
  {
    question: "Does the app work on mobile devices?",
    answer:
      "The layout is responsive and supports mobile navigation, though larger file-processing tasks are usually easier on desktop.",
  },
];

const FAQ = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <section className="rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 sm:px-10 py-12 bg-linear-to-br from-amber-50 via-white to-sky-50 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200 text-amber-700 shadow-sm mb-5">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">FAQ</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Common questions and quick answers
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 leading-8">
            Use this page to troubleshoot common issues before opening a report.
          </p>
        </div>

        <div className="p-6 sm:p-10 space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 open:bg-white open:shadow-lg open:shadow-slate-200/60 transition-all"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-left">
                <span className="text-lg font-bold text-slate-900">
                  {item.question}
                </span>
                <span className="text-slate-400 text-2xl font-light transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-slate-600 leading-7">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="px-6 sm:px-10 pb-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            If your question is not covered here, open a GitHub issue so the
            answer can be documented for everyone.
          </p>
          <a
            href="https://github.com/Durgeshwar-AI/pdfToPng/issues"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-transform hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
            Open GitHub Issues
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
