import type { Metadata } from "next";
import LegalPage, { Section, Lead } from "@/components/LegalPage";
import { SHIPPING_RATES, deliveryIncVat } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Delivery & Returns",
  description:
    "Delivery options, charges and timescales, plus our returns and refunds policy for Bellos Bespoke Tiles.",
  alternates: { canonical: "/delivery-returns" },
};

export default function DeliveryReturnsPage() {
  return (
    <LegalPage
      title="Delivery & Returns"
      breadcrumb="Delivery & Returns"
      lastUpdated="6 September 2026"
    >
      <Lead>
        Everything you need to know about how we deliver your tiles, how much it
        costs, and what to do if you need to return something. If you have any
        questions, our team is always happy to help.
      </Lead>

      {/* DELIVERY */}
      <Section heading="Delivery charges">
        <p>
          Delivery is charged based on the total weight of your order and is
          calculated automatically at checkout before you pay. Our current
          mainland UK rates are:
        </p>
        <div className="mt-4 border border-[#E8E5E0] rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white text-left text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">
                <th className="px-4 py-3 font-medium">Order weight</th>
                <th className="px-4 py-3 font-medium">Delivery charge</th>
                <th className="px-4 py-3 font-medium">Inc. VAT</th>
              </tr>
            </thead>
            <tbody>
              {SHIPPING_RATES.map((rate, i) => {
                const isFirst = i === 0;
                const isLast = i === SHIPPING_RATES.length - 1;
                const band = isFirst
                  ? `Up to ${rate.max} kg`
                  : isLast
                    ? `Over ${SHIPPING_RATES[i - 1].max} kg`
                    : `${rate.min}–${rate.max} kg`;
                return (
                  <tr
                    key={i}
                    className="border-t border-[#E8E5E0] text-[#4a4a4a]"
                  >
                    <td className="px-4 py-3">{band}</td>
                    <td className="px-4 py-3">£{rate.price.toFixed(2)} + VAT</td>
                    <td className="px-4 py-3">£{deliveryIncVat(rate.price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#9A9A9A]">
          Weights shown in kilograms. VAT at 20% is added to the delivery
          charge at checkout. Deliveries to the Scottish Highlands,
          islands, Northern Ireland and other remote areas may incur an
          additional surcharge — we will contact you if so.
        </p>
      </Section>

      <Section heading="Delivery timescales">
        <ul>
          <li>
            In-stock items are typically dispatched within 2–5 working days.
          </li>
          <li>
            Bespoke and made-to-order tiles have longer lead times, which we
            will confirm with you when you order.
          </li>
          <li>
            You will receive an email when your order is dispatched. Larger
            pallet deliveries are usually booked in with you for a delivery date.
          </li>
        </ul>
      </Section>

      <Section heading="Delivery area">
        <p>
          We currently deliver to addresses within the United Kingdom only. A
          valid UK postcode is required at checkout.
        </p>
      </Section>

      <Section heading="Receiving your order">
        <ul>
          <li>
            Please make sure someone is available to receive and check the
            delivery. Tiles are heavy and often delivered on a pallet.
          </li>
          <li>
            Inspect your order on arrival and before signing where possible. If
            packaging is visibly damaged, note this with the courier.
          </li>
          <li>
            Do not book your installer until you have received and checked all of
            your tiles.
          </li>
        </ul>
      </Section>

      {/* RETURNS */}
      <Section heading="Returns &amp; cancellations">
        <p>
          Under the Consumer Contracts Regulations, if you are a consumer you
          have the right to cancel most orders within 14 days of receiving them,
          for any reason. To cancel, email us at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>{" "}
          with your order number. You then have a further 14 days to return the
          goods.
        </p>
        <ul>
          <li>
            Returned items must be unused, in their original undamaged packaging
            and in a resaleable condition.
          </li>
          <li>
            You are responsible for the cost of returning items unless they are
            faulty or incorrect. Because tiles are heavy and fragile, we
            recommend a tracked, insured service.
          </li>
          <li>
            A restocking fee may apply to large or special orders; we will make
            this clear before you return.
          </li>
        </ul>
      </Section>

      <Section heading="Non-returnable items">
        <p>
          Bespoke, cut-to-size and made-to-order tiles are produced specifically
          for you and cannot be returned or refunded unless they are faulty or
          not as described. This does not affect your statutory rights in
          respect of faulty goods.
        </p>
      </Section>

      <Section heading="Damaged, faulty or incorrect items">
        <p>
          We carefully pack every order, but breakages can occasionally happen
          in transit. If any items arrive damaged, faulty or incorrect, please
          contact us within <strong>48 hours of delivery</strong> at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>
          , quoting your order number and including photographs of the damage and
          packaging. We will arrange a replacement or refund as quickly as
          possible.
        </p>
      </Section>

      <Section heading="Refunds">
        <p>
          Once we have received and inspected your return, we will process your
          refund to your original payment method within 14 days. Original
          delivery charges are refundable for faulty or incorrect items, and for
          full cancellations made under your statutory cancellation rights.
        </p>
      </Section>

      <Section heading="Need help?">
        <p>
          For anything to do with delivery or returns, contact our team at{" "}
          <a href="mailto:sales@bellosbespoketiles.co.uk">
            sales@bellosbespoketiles.co.uk
          </a>{" "}
          or call 07498 359 060.
        </p>
      </Section>
    </LegalPage>
  );
}
