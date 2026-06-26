import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Zap, HardDrive, Github } from 'lucide-react';
import PageLayout, { Section } from '../components/PageLayout';

const highlights = [
  {
    icon: <Lock className="h-6 w-6 text-blue-600" />,
    title: 'Privacy-first',
    description:
      'Your files are processed in your browser whenever possible and are never persistently stored on our servers.',
  },
  {
    icon: <Zap className="h-6 w-6 text-orange-500" />,
    title: 'Fast & free',
    description:
      'Every tool is free to use with no sign-up, no watermarks, and no waiting in queues.',
  },
  {
    icon: <HardDrive className="h-6 w-6 text-teal-500" />,
    title: 'No storage limits',
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
        We believe everyday file conversions shouldn't require an account, a subscription, or
        handing your documents to a third party. pdfToPng brings a growing collection of PDF and
        image utilities together in one place — fast, free, and built to respect your privacy.
      </p>
    </Section>

    <Section title="What we offer">
      <p>
        From converting PDF pages to PNG images, merging and splitting documents, signing and
        watermarking files, to compressing, resizing, and converting images between formats — our
        tools cover the most common document and image tasks without ever leaving your browser.
      </p>
    </Section>

    <Section title="Why people choose pdfToPng">
      <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-3">
        {highlights.map(item => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700">
              {item.icon}
            </div>
            <h3 className="mb-1 font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Open source">
      <p>
        pdfToPng is open source and built with the community. Contributions, bug reports, and
        feature ideas are always welcome.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href="https://github.com/Durgeshwar-AI/pdfToPng"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-purple-700"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
        <Link
          to="/#tools"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-300 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500"
        >
          Explore the tools
        </Link>
      </div>
    </Section>
  </PageLayout>
);

export default About;
