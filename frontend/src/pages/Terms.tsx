import React from "react";
import PageLayout, { Section } from "../components/PageLayout";

const Terms = () => (
  <PageLayout
    title="Terms of Service"
    subtitle="Last updated: June 6, 2026"
  >
    <Section title="Acceptance of terms">
      <p>
        By accessing or using pdfToPng, you agree to these Terms of Service. If
        you do not agree with any part of these terms, please discontinue use of
        the service.
      </p>
    </Section>

    <Section title="Use of the service">
      <p>
        pdfToPng provides free, browser-based tools for converting and editing
        PDF and image files. The service is provided for your personal and
        business use, subject to the acceptable use rules below.
      </p>
    </Section>

    <Section title="Acceptable use">
      <p>You agree not to use pdfToPng to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Process content that is unlawful, infringing, or that you do not have the right to use.</li>
        <li>Attempt to disrupt, overload, or reverse engineer the service.</li>
        <li>Circumvent any limitations or security measures of the service.</li>
      </ul>
    </Section>

    <Section title="Intellectual property">
      <p>
        You retain all rights to the files you process. pdfToPng claims no
        ownership over your content. The pdfToPng name, branding, and software
        remain the property of their respective owners and contributors.
      </p>
    </Section>

    <Section title="Disclaimer of warranties">
      <p>
        The service is provided "as is" and "as available" without warranties of
        any kind, whether express or implied. We do not guarantee that the
        service will be uninterrupted, error-free, or that conversions will be
        suitable for every use case.
      </p>
    </Section>

    <Section title="Limitation of liability">
      <p>
        To the fullest extent permitted by law, pdfToPng and its contributors
        shall not be liable for any indirect, incidental, or consequential
        damages arising from your use of, or inability to use, the service.
      </p>
    </Section>

    <Section title="Changes to these terms">
      <p>
        We may revise these terms from time to time. Continued use of the
        service after changes take effect constitutes acceptance of the updated
        terms.
      </p>
    </Section>

    <Section title="Contact">
      <p>
        If you have questions about these terms, reach us through the links in
        the site footer.
      </p>
    </Section>
  </PageLayout>
);

export default Terms;
