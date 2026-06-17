import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section, Lead } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions governing the sale of tiles and related products by Bellos Bespoke Tiles.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      breadcrumb="Terms"
      lastUpdated="17 June 2026"
    >
      <Lead>
        These terms and conditions set out the basis on which Bellos Bespoke
        Tiles (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) sells
        products to you through our website. By placing an order you agree to be
        bound by these terms. Please read them carefully before ordering.
      </Lead>

      <Section heading="1. About us">
        <p>
          Bellos Bespoke Tiles is a tile retailer based at 205 Regent Street,
          London W1B 4HB. You can contact us at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>{" "}
          or on 07498 359 060. Registered in England &amp; Wales, company
          number 16633196. VAT number GB 504587780.
        </p>
      </Section>

      <Section heading="2. Placing an order">
        <p>
          When you place an order you are making an offer to purchase the
          products in your basket. We will send you an order acknowledgement by
          email, but a contract between us is only formed once we confirm that
          your order has been dispatched. We reserve the right to decline or
          cancel any order.
        </p>
      </Section>

      <Section heading="3. Pricing and payment">
        <ul>
          <li>
            All prices are shown in pounds sterling (GBP) and include VAT where
            applicable.
          </li>
          <li>
            Delivery charges are calculated at checkout based on the weight of
            your order and are shown before you confirm payment.
          </li>
          <li>
            Payment is taken securely at checkout via Stripe. We accept the
            major debit and credit cards supported by our payment provider.
          </li>
          <li>
            While we take care to ensure prices are accurate, if we discover an
            error in the price of products you have ordered we will contact you
            to confirm whether you wish to proceed.
          </li>
        </ul>
      </Section>

      <Section heading="4. Products, tiles and natural variation">
        <p>
          We make every effort to display our products accurately, but please
          note:
        </p>
        <ul>
          <li>
            Colours and finishes on screen may differ slightly from the actual
            product depending on your display. We recommend ordering a sample
            where colour is critical.
          </li>
          <li>
            Tile sizes quoted are nominal manufacturing sizes. Natural variation
            of up to around 2mm between batches is normal and within industry
            tolerance.
          </li>
          <li>
            Shade, pattern and texture can vary between batches. We recommend you
            order all the tiles you need in one go and inspect them before
            installation.
          </li>
          <li>
            We strongly recommend ordering at least 10% more than your measured
            area to allow for cuts, wastage and future repairs.
          </li>
        </ul>
      </Section>

      <Section heading="5. Bespoke and made-to-order items">
        <p>
          Some of our products are bespoke or made to your specification.
          Because these items are produced specifically for you, they are
          generally non-returnable and non-refundable unless faulty, in line
          with the Consumer Contracts Regulations. We will make this clear at
          the point of order where it applies.
        </p>
      </Section>

      <Section heading="6. Delivery">
        <p>
          Delivery timescales, charges and arrangements are set out in our{" "}
          <Link href="/delivery-returns">Delivery &amp; Returns</Link> policy,
          which forms part of these terms.
        </p>
      </Section>

      <Section heading="7. Cancellations, returns and refunds">
        <p>
          Your rights to cancel, return items and obtain refunds are set out in
          full in our{" "}
          <Link href="/delivery-returns">Delivery &amp; Returns</Link> policy.
          Nothing in these terms affects your statutory rights as a consumer.
        </p>
      </Section>

      <Section heading="8. Damaged or faulty goods">
        <p>
          Please inspect your order on arrival. If any items are damaged,
          faulty or incorrect, contact us within 48 hours of delivery at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>{" "}
          with your order number and photographs so we can put it right.
        </p>
      </Section>

      <Section heading="9. Our liability">
        <p>
          We are responsible for loss or damage you suffer that is a
          foreseeable result of our breaking these terms or failing to use
          reasonable care and skill. We are not liable for installation costs,
          labour, or any consequential losses arising from the use of our
          products. We do not exclude or limit our liability where it would be
          unlawful to do so, including for death or personal injury caused by
          our negligence. Nothing in these terms affects your statutory rights.
        </p>
      </Section>

      <Section heading="10. Governing law">
        <p>
          These terms are governed by the laws of England and Wales, and any
          disputes will be subject to the exclusive jurisdiction of the courts
          of England and Wales.
        </p>
      </Section>

      <Section heading="11. Contact">
        <p>
          For any questions about these terms, please email{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
