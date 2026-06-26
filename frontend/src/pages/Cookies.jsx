import React from 'react';
import PageLayout, { Section } from '../components/PageLayout';

const Cookies = () => (
  <PageLayout title="Cookie Policy" subtitle="Last updated: June 6, 2026">
    <Section title="What are cookies?">
      <p>
        Cookies are small text files stored on your device by your browser. Along with similar
        technologies like local storage, they help websites remember information about your visit.
      </p>
    </Section>

    <Section title="How we use them">
      <p>
        pdfToPng uses cookies and browser storage sparingly and only for functional purposes — such
        as remembering interface preferences and keeping the tools working smoothly. We do not use
        cookies to build advertising profiles or to sell your data.
      </p>
    </Section>

    <Section title="Types of cookies we use">
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Essential:</strong> Required for the site and tools to function correctly.
        </li>
        <li>
          <strong>Preferences:</strong> Remember choices you make, like display settings.
        </li>
        <li>
          <strong>Analytics (anonymous):</strong> Help us understand which tools are used so we can
          improve them, without identifying you personally.
        </li>
      </ul>
    </Section>

    <Section title="Managing cookies">
      <p>
        You can control or delete cookies through your browser settings. Disabling essential cookies
        may affect how parts of the site work.
      </p>
    </Section>

    <Section title="Contact">
      <p>Questions about our use of cookies? Reach us through the links in the site footer.</p>
    </Section>
  </PageLayout>
);

export default Cookies;
