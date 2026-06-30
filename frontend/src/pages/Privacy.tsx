import React from "react";
import PageLayout, { Section } from "../components/PageLayout";

const Privacy = () => (
  <PageLayout
    title="Privacy Policy"
    subtitle="Last updated: June 6, 2026"
  >
    <Section title="Overview">
      <p>
        pdfToPng is built to be privacy-first. This policy explains what
        information we do and don't collect when you use our tools, and how we
        handle the files you process.
      </p>
    </Section>

    <Section title="Your files">
      <p>
        Most conversions happen entirely in your browser. When a tool can run
        locally, your files never leave your device. For any feature that
        requires server-side processing, files are handled transiently to
        complete your request and are not persistently stored or retained
        afterward.
      </p>
    </Section>

    <Section title="Information we collect">
      <p>
        We do not require an account to use pdfToPng, and we don't ask for
        personal information to operate the tools. We may collect limited,
        anonymous usage and diagnostic data (such as which tools are used and
        error reports) to keep the service reliable and improve it over time.
      </p>
    </Section>

    <Section title="Cookies and local storage">
      <p>
        We use essential cookies and browser storage only where needed to make
        the site work (for example, remembering interface preferences). See our
        Cookie Policy for details.
      </p>
    </Section>

    <Section title="Third-party services">
      <p>
        We may rely on third-party infrastructure (such as hosting and content
        delivery) to serve the site. These providers process requests only as
        necessary to deliver pdfToPng to you and do not receive your files for
        storage.
      </p>
    </Section>

    <Section title="Your rights">
      <p>
        Because we don't store your files or maintain user accounts, there is
        typically no personal data for us to retain. If you have questions about
        your data or this policy, you can contact us at any time.
      </p>
    </Section>

    <Section title="Changes to this policy">
      <p>
        We may update this policy from time to time. Material changes will be
        reflected on this page with an updated revision date.
      </p>
    </Section>

    <Section title="Contact">
      <p>
        Questions about privacy? Reach us through the links in the site footer.
      </p>
    </Section>
  </PageLayout>
);

export default Privacy;
