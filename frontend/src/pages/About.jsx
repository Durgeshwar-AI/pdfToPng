import React from "react";
import { Link } from "react-router-dom";
import { Lock, Zap, HardDrive, Github } from "lucide-react";
import PageLayout, { Section } from "../components/PageLayout";

const highlights = [
  {
    icon: <Lock className="w-6 h-6 text-blue-600" />,
    title: "Privacy-first",
    description:
      "Your files are processed in your browser whenever possible and are never persistently stored on our servers.",
  },
  {
    icon: <Zap className="w-6 h-6 text-orange-500" />,
    title: "Fast & free",
    description:
      "Every tool is free to use with no sign-up, no watermarks, and no waiting in queues.",
  },
  {
    icon: <HardDrive className="w-6 h-6 text-teal-500" />,
    title: "No storage limits",
    description:
      "We don't retain your data, so there are no upload caps or storage tiers to worry about.",
  },
];

const About = () => (
  <PageLayout
    title="About Us"
    subtitle="pdfToPng is a free, privacy-focused suite of PDF and image tools that run right in your browser."
  >
    <Section title="Our mission">
      <p>
        We believe everyday file conversions shouldn't require an account, a
        subscription, or handing your documents to a third party. pdfToPng
        brings a growing collection of PDF and image utilities together in one
        place — fast, free, and built to respect your privacy.
      </p>
    </Section>

    <Section title="What we offer">
      <p>
        From converting PDF pages to PNG images, merging and splitting
        documents, signing and watermarking files, to compressing, resizing,
        and converting images between formats — our tools cover the most common
        document and image tasks without ever leaving your browser.
      </p>
    </Section>

    <Section title="Why people choose pdfToPng">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Open source">
      <p>
        pdfToPng is open source and built with the community. Contributions,
        bug reports, and feature ideas are always welcome.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href="https://github.com/Durgeshwar-AI/pdfToPng"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors duration-300"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
        <Link
          to="/#tools"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-700 text-sm font-semibold px-5 py-2.5 transition-colors duration-300"
        >
          Explore the tools
        </Link>
      </div>
    </Section>
  </PageLayout>
);

export default About;
