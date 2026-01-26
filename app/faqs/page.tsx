const sections = [
  {
    id: "tiles",
    title: "Tiles",
    items: [
      {
        question: "What Are Rectified Tiles?",
        answer: (
          <p>
            Rectified tiles, or sharp edge tiles as they can be known, are
            Ceramic or Porcelain Tiles that have been manufactured to a very
            precise tolerance. This means they are cut to near exact
            measurements with a near perfect straight edge. The cleaner edges
            also make it easier to create intricate laying patterns as you have
            more flexibility with the grout line width, a prime example being
            basket weave.
          </p>
        ),
      },
      {
        question: "Are the tile sizes correct?",
        answer: (
          <p>
            The sizes that are stated are the sizes that the goods are
            manufactured to - referred to as "nominal sizes". This means that
            due to the manufacturing process and nature of tiles, the exact
            sizes cannot be manufactured consistently and that different batches
            of the same tile can vary in size by as much as 2mm, which is a
            widely accepted tolerance within the industry.
          </p>
        ),
      },
      {
        question: "Will all the tiles be available in the same batch?",
        answer: (
          <p>
            We will always try and send tiles or flooring out from the same
            batch, however, this is not always practical or possible. It is
            recommended that you do not fix any tiles or flooring until all
            items have been inspected prior to installation to avoid any
            potential batch shading problems.
          </p>
        ),
      },
      {
        question: "When should I book my tiler, plumber or installer?",
        answer: (
          <p>
            Many people will book their installer prior to placing their order,
            but this will cause issues if there are any delays in delivery or if
            you have received a damaged item and/or have decided to change your
            mind about it. We therefore recommend you book your installer
            roughly two weeks after the estimated delivery date, giving you time
            to receive the goods and inspect the items prior to installation.
          </p>
        ),
      },
    ],
  },
  {
    id: "ordering",
    title: "Placing an Order",
    items: [
      {
        question:
          "I have a question about a product. Where can I find more information?",
        answer: (
          <p>
            Please visit our product pages. Alternatively, you can call our
            Tiles or Fittings numbers where our knowledgeable staff are
            available to answer all your questions: Tiles: 07498 359 060.
            Fittings: 07718 236 035.
          </p>
        ),
      },
      {
        question:
          "Can I order a single tile or do I have to purchase a complete box?",
        answer: (
          <p>
            All our products are sold in full boxes. How the product is sold is
            indicated on the product page.
          </p>
        ),
      },
      {
        question: "Can I order samples?",
        answer: (
          <p>
            Yes, you can order samples for the majority of items on our website
            via the product page. Samples are not full-size tiles, they are 100mm
            x 100mm chips.
          </p>
        ),
      },
      {
        question: "Can I change my order details after I have placed it?",
        answer: (
          <p>
            Any changes to your order can be requested before the order has
            been dispatched by emailing sales@bellosbespoketiles.co.uk.
          </p>
        ),
      },
      {
        question: "Can I cancel an order once it has been placed?",
        answer: (
          <p>
            Yes, you can cancel an order once it has been placed. Charges may
            apply if the order has already been dispatched (delivery or
            re-stocking fees where applicable). If the order has not yet been
            dispatched, then we can cancel this without a cost being involved.
          </p>
        ),
      },
      {
        question: "When will I receive order confirmation?",
        answer: (
          <p>
            Once your online order has been processed you will receive an
            immediate confirmation via email. If you have not received an email
            within 30 minutes of completing your order, we advise you check your
            junk/spam or deleted items folder in your email inbox. Please make
            sure the email address you provide is correct.
          </p>
        ),
      },
      {
        question: "I have decided to tile another area and need to order more",
        answer: (
          <p>
            We would highly recommend that any additional orders refer to the
            original batch/order number, so that we can try and match them for
            you. This is due to different batches producing different shades
            and sizes.
          </p>
        ),
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        question: "What payments do you accept?",
        answer: (
          <div className="space-y-3">
            <p>
              We aim to make your checkout experience as seamless and secure as
              possible. Through our partnership with Stripe, we accept a wide
              variety of payment methods:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Visa</li>
              <li>Mastercard</li>
              <li>American Express (Amex)</li>
              <li>Discover and Diners Club</li>
              <li>JCB</li>
              <li>China UnionPay</li>
            </ul>
            <p>Digital wallets:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Apple Pay</li>
              <li>Google Pay</li>
              <li>Link (Stripe 1-click checkout)</li>
            </ul>
            <p>Buy Now, Pay Later (BNPL):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Klarna: pay in 30 days or split into interest-free installments</li>
            </ul>
          </div>
        ),
      },
      {
        question: "Do your prices include VAT?",
        answer: <p>VAT is added at checkout and is clearly visible.</p>,
      },
      {
        question:
          "I have cancelled my order, how long will it take to get my refund?",
        answer: (
          <p>
            We are currently aiming to process all refunds from order
            cancellations within 10 working days. If you have not received your
            refund within 10 working days, please contact
            sales@bellosbespoketiles.co.uk.
          </p>
        ),
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      {
        question: "How will the tiles be delivered?",
        answer: (
          <p>
            Tiles will be shrink wrapped on a pallet and delivered to the ground
            level edge of your property (kerbside delivery). Due to insurance
            policies and health and safety regulations, the driver will not
            transport any goods into the property. Orders under 20kg weight will
            be delivered with a parcel courier.
          </p>
        ),
      },
      {
        question: "When is my order being delivered?",
        answer: (
          <p>
            Your order will be delivered usually within 2-5 working days. Orders
            to difficult to reach postcodes will be delivered within 7-10
            working days. Orders placed over the weekend or during a bank
            holiday will be processed the next working day. If available, you
            can check the tracking number in your Bellos Account area.
          </p>
        ),
      },
      {
        question: "How will I know when my order will arrive?",
        answer: (
          <p>
            We will contact you by email to confirm the material has been
            dispatched, along with the delivery lead time. All orders are
            delivered between 8am and 6pm Monday-Friday. Please note: delivery
            dates can change on occasion due to circumstances beyond our
            control. Delivery timetables are best estimates and may be subject
            to change due to seasonality, weather and other non-specified
            factors. When we give a date for delivery, this will be an estimate
            and not a guaranteed firm date. However, you will be notified as
            soon as we are informed of any delivery changes.
          </p>
        ),
      },
      {
        question: "What should I do when my order arrives?",
        answer: (
          <p>
            When your order arrives, we recommend that you inspect all items to
            ensure that the products supplied are correct and that nothing is
            damaged. You should also check that the batch information matches
            across all boxes of the same product. If the material arrives
            damaged, please mark this clearly on the delivery note before
            signing for the material. Please notify us of any faults or damages
            within 48 hours by contacting our Tile Team on 07498 359 060 or
            alternatively, email sales@bellosbespoketiles.co.uk so that we can
            help to rectify any problems as swiftly as possible.
          </p>
        ),
      },
      {
        question: "Do I have to sign for my delivery?",
        answer: (
          <p>
            Your consignment will require a signature upon arrival at the
            property. When placing your order, you will have the option to leave
            additional information regarding the delivery or directions to help
            your delivery driver.
          </p>
        ),
      },
      {
        question: "Can my order be delivered at a specific time?",
        answer: (
          <p>
            We are unable to offer specific time slots for delivery due to high
            demand. We are working with our delivery partners to improve our
            delivery options.
          </p>
        ),
      },
      {
        question: "What if I am not home when the delivery arrives?",
        answer: (
          <p>
            Unless by prior arrangement, the driver will not leave the
            consignment. If a second delivery attempt is required, an additional
            charge of GBP 40.00 is likely to be incurred. Please call our Tile
            Team as soon as possible on 07498 359 060.
          </p>
        ),
      },
      {
        question: "How do I arrange for my order to be left in a safe place?",
        answer: (
          <p>
            If you are aware that you will not be at the delivery address at the
            time of delivery, you can leave special instruction in the order
            form to let us know where it is safe to leave your order.
          </p>
        ),
      },
      {
        question: "Do you deliver outside the UK?",
        answer: <p>We do not offer delivery to other countries on the website.</p>,
      },
      {
        question:
          "Where do you deliver to and if so, is there an additional charge?",
        answer: (
          <p>
            We pride ourselves on delivering to almost all areas of mainland UK.
            However, we are currently unable to deliver to certain areas in the
            Highlands and Offshore Islands (please view excluded postcodes on
            our Delivery page). Please contact our Customer Service Team on
            07498 359 060 and we will check whether we can deliver to your
            postcode.
          </p>
        ),
      },
      {
        question: "Can I get my order delivered to another address?",
        answer: (
          <p>
            Yes, we will need to ask you some security questions and we will
            need details of the new address. However we advise that delivery
            address is correct at the time of order to avoid delays and extra
            cost to you.
          </p>
        ),
      },
      {
        question: "Can I return my pallet/s with the driver?",
        answer: (
          <p>
            We use a courier network to deliver all palletised deliveries. This
            enables us to keep our prices low and for large parts of the UK,
            unfortunately, this means the driver is unable to take your pallet
            away with them.
          </p>
        ),
      },
    ],
  },
  {
    id: "returns",
    title: "Damages and Returns",
    items: [
      {
        question: "What do I do if some of my order arrives damaged?",
        answer: (
          <p>
            If any packaging shows signs of damage, please mark this clearly on
            the delivery note when signing for the material. Damages and order
            shortages must be communicated within 48 hours of delivery. Please
            contact our Customer Service Team on
            sales@bellosbespoketiles.co.uk quoting your order number and
            delivery note, and take clear photos of the damages and we will
            ensure replacement parts are sent out immediately.
          </p>
        ),
      },
      {
        question: "The order has arrived and it is not what I expected",
        answer: (
          <p>
            If you have ordered a sample, we will obviously carry out checks to
            ensure you have had the correct order picked and may ask you for an
            image of it next to what has been delivered. This will help us work
            out what has happened and help to resolve the situation. If samples
            have not been ordered, Wall and Floor Solutions Ltd cannot be held
            responsible for any discrepancies between the tiles and flooring
            ordered and the images/products on screen. We will, however, accept
            the goods back for a refund. Please see our Terms and Conditions/
            Returns page for more information.
          </p>
        ),
      },
      {
        question: "After installation can my damaged tiles be replaced?",
        answer: (
          <p>
            If once fitted your tiles become damaged it is possible to purchase
            additional tiles and for them to be removed and replaced; a
            suitable tradesperson would be able to assist with this. We always
            recommend keeping any spare tiles from your tile installation to
            ensure you have replacements and the same batch number.
          </p>
        ),
      },
      {
        question: "What is your return policy?",
        answer: (
          <p>
            For full information on our returns policy, please read our Terms
            and Conditions and Returns pages.
          </p>
        ),
      },
      {
        question: "How do I return my order?",
        answer: (
          <p>
            If you wish to return your order and it falls in line with our Terms
            and Conditions, you will have to contact our Customer Service Team
            prior to sending the item back. You will be responsible for
            returning the item back to us yourself, but you may be eligible for
            a free return if you are returning damages. All instructions on how
            to send the item back will be supplied by Customer Service.
          </p>
        ),
      },
      {
        question: "How do I make a complaint?",
        answer: (
          <p>
            We are sorry to hear you have been disappointed. If you wish to
            make a complaint, please get in touch with our Customer Service Team
            via email sales@bellosbespoketiles.co.uk.
          </p>
        ),
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <main className="bg-white text-[#1c1c1c]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold">FAQs</h1>
        <p className="mt-3 text-[#4a4a4a]">
          Browse the sections below to find quick answers to common questions.
        </p>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <details key={section.id} className="border border-[#e6e6e6] rounded">
              <summary className="cursor-pointer select-none px-5 py-4 text-sm uppercase tracking-[0.2em] text-[#1c1c1c] flex items-center justify-between">
                <span>{section.title}</span>
                <span className="text-[#9b9b9b]">+</span>
              </summary>
              <div className="px-5 pb-5 pt-2 space-y-4 text-[#333333]">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="border border-[#efefef] rounded"
                  >
                    <summary className="cursor-pointer select-none px-4 py-3 font-medium text-[#1c1c1c]">
                      {item.question}
                    </summary>
                    <div className="px-4 pb-4 pt-1 text-sm leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
