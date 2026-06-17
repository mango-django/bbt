import type { Metadata } from "next";
import LegalPage, { Section, Lead } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Bellos Bespoke Tiles collects, uses and protects your personal data in line with UK GDPR.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="17 June 2026">
      <Lead>
        This Privacy Policy explains how Bellos Bespoke Tiles (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, stores and protects
        your personal information when you visit our website, place an order, or
        contact us. We are committed to handling your data responsibly and in
        accordance with the UK General Data Protection Regulation (UK GDPR) and
        the Data Protection Act 2018.
      </Lead>

      <Section heading="Who we are">
        <p>
          Bellos Bespoke Tiles is a tile retailer based in the United Kingdom.
          For the purposes of data protection law, we are the data controller of
          the personal information you provide to us.
        </p>
        <ul>
          <li>Address: 205 Regent Street, London W1B 4HB</li>
          <li>
            Email:{" "}
            <a href="mailto:sales@bellosbespoketiles.co.uk">
              sales@bellosbespoketiles.co.uk
            </a>
          </li>
          <li>Telephone: 07498 359 060</li>
          <li>
            Company registration number: 16633196 &middot; VAT number: GB
            504587780
          </li>
        </ul>
      </Section>

      <Section heading="Information we collect">
        <p>We may collect and process the following information about you:</p>
        <ul>
          <li>
            <strong>Identity &amp; contact data</strong> — name, billing and
            delivery address, email address and telephone number.
          </li>
          <li>
            <strong>Order data</strong> — details of the products you purchase,
            order history and any bespoke tile specifications you provide.
          </li>
          <li>
            <strong>Payment data</strong> — payments are processed securely by
            our payment provider, Stripe. We do not store your full card
            details on our own systems.
          </li>
          <li>
            <strong>Account data</strong> — your login email and an encrypted
            password if you create an account.
          </li>
          <li>
            <strong>Technical &amp; usage data</strong> — IP address, browser
            type, device information and pages visited, collected via cookies
            and analytics.
          </li>
        </ul>
      </Section>

      <Section heading="How we use your information">
        <p>We use your personal data to:</p>
        <ul>
          <li>Process, fulfil and deliver your orders;</li>
          <li>Take payment and provide refunds where applicable;</li>
          <li>
            Communicate with you about your order, including dispatch and
            delivery updates;
          </li>
          <li>Respond to your enquiries and provide customer support;</li>
          <li>Manage your account;</li>
          <li>
            Send you marketing communications where you have consented (you can
            opt out at any time);
          </li>
          <li>
            Improve our website, products and services, and meet our legal and
            regulatory obligations.
          </li>
        </ul>
      </Section>

      <Section heading="Lawful bases for processing">
        <p>We rely on the following lawful bases:</p>
        <ul>
          <li>
            <strong>Contract</strong> — to fulfil an order you have placed with
            us.
          </li>
          <li>
            <strong>Legal obligation</strong> — to comply with accounting, tax
            and consumer-protection law.
          </li>
          <li>
            <strong>Legitimate interests</strong> — to run and improve our
            business and prevent fraud.
          </li>
          <li>
            <strong>Consent</strong> — for optional marketing and
            non-essential cookies.
          </li>
        </ul>
      </Section>

      <Section heading="Sharing your information">
        <p>
          We never sell your personal data. We share it only with trusted third
          parties who help us operate, including:
        </p>
        <ul>
          <li>Stripe — secure payment processing;</li>
          <li>Our delivery and courier partners — to deliver your order;</li>
          <li>Email and hosting providers — to send order confirmations and run the site;</li>
          <li>
            Professional advisers and authorities — where required by law.
          </li>
        </ul>
      </Section>

      <Section heading="Cookies">
        <p>
          Our website uses cookies to make it function correctly (for example,
          to remember items in your basket) and to understand how visitors use
          the site. You can control or disable cookies through your browser
          settings, although some parts of the site may not work properly
          without them.
        </p>
      </Section>

      <Section heading="Data retention">
        <p>
          We keep your personal data only for as long as necessary to fulfil the
          purposes we collected it for, including to satisfy legal, accounting
          or reporting requirements. Order and transaction records are typically
          retained for at least six years to meet HMRC requirements.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>Under UK data protection law you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you;</li>
          <li>Request correction of inaccurate data;</li>
          <li>Request erasure of your data in certain circumstances;</li>
          <li>Object to or restrict our processing of your data;</li>
          <li>Request the transfer of your data (data portability);</li>
          <li>Withdraw consent at any time where we rely on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>
          . You also have the right to lodge a complaint with the Information
          Commissioner&rsquo;s Office (ICO) at{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            ico.org.uk
          </a>
          .
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with a revised &ldquo;last updated&rdquo; date.
        </p>
      </Section>

      <Section heading="Contact us">
        <p>
          If you have any questions about this Privacy Policy or how we handle
          your data, please contact us at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
