import React from 'react';
import PageLayout, { Section } from '../components/PageLayout';

const Gdpr = () => (
  <PageLayout title="GDPR Compliance" subtitle="Last updated: June 6, 2026">
    <Section title="Our commitment">
      <p>
        pdfToPng is designed around data minimization, a core principle of the EU General Data
        Protection Regulation (GDPR). We aim to collect as little data as possible and to process
        your files without retaining them.
      </p>
    </Section>

    <Section title="Data we process">
      <p>
        Files you convert are processed in your browser where possible, or transiently on the server
        when required, and are not stored afterward. We do not require accounts and do not collect
        personal information to operate the tools. Limited anonymous diagnostics may be used to keep
        the service reliable.
      </p>
    </Section>

    <Section title="Legal basis for processing">
      <p>
        Where we process any limited data, we rely on legitimate interests — specifically,
        delivering and maintaining a secure, functional service — and on your consent where
        required.
      </p>
    </Section>

    <Section title="Your rights under GDPR">
      <p>If you are in the EU/EEA, you have the right to:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction or erasure of your data.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Data portability, where applicable.</li>
        <li>Lodge a complaint with your local supervisory authority.</li>
      </ul>
      <p>
        Because we generally don't store your files or maintain user accounts, there is usually
        little or no personal data for us to act on — but you may contact us to exercise any of
        these rights.
      </p>
    </Section>

    <Section title="International data transfers">
      <p>
        Any transient processing is carried out using infrastructure with appropriate safeguards in
        place. We do not retain your files in any region after your request is complete.
      </p>
    </Section>

    <Section title="Contact">
      <p>
        For any GDPR-related request or question, reach us through the links in the site footer.
      </p>
    </Section>
  </PageLayout>
);

export default Gdpr;
