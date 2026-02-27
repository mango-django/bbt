import Link from "next/link";
import Image from "next/image";

export default function ContactUsPage() {
  return (
    <main className="bg-[#FAFAF8]">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              Home
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">Contact</span>
          </nav>
        </div>
      </div>

      {/* Hero strip */}
      <div className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <Image
          src="/hero-bathroom.webp"
          alt="Bellos showroom"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/60 mb-4">
            We'd love to hear from you
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-wider">
            Get in Touch
          </h1>
          <div className="w-10 h-px bg-white/40 mt-6" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* LEFT — contact details */}
          <div>

            {/* Visit us */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Visit Us
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>
              <div className="border border-[#E8E5E0] bg-white px-6 py-5">
                <p className="text-sm font-light text-[#1A1A1A] leading-relaxed tracking-wide">
                  4th Floor Office<br />
                  205 Regent Street<br />
                  London W1B 4HB
                </p>
              </div>
            </div>

            {/* Contact numbers */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Call Us
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>
              <div className="border border-[#E8E5E0] bg-white px-6 py-1">
                <div className="grid grid-cols-5 gap-4 py-4 border-b border-[#E8E5E0]">
                  <p className="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Tiles</p>
                  <a
                    href="tel:07498359060"
                    className="col-span-3 text-sm font-light text-[#1A1A1A] hover:text-[#9A7A5E] transition-colors"
                  >
                    07498 359 060
                  </a>
                </div>
                <div className="grid grid-cols-5 gap-4 py-4">
                  <p className="col-span-2 text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E]">Fittings</p>
                  <a
                    href="tel:07718236035"
                    className="col-span-3 text-sm font-light text-[#1A1A1A] hover:text-[#9A7A5E] transition-colors"
                  >
                    07718 236 035
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                  Email Us
                </p>
                <div className="flex-1 h-px bg-[#E8E5E0]" />
              </div>
              <div className="border border-[#E8E5E0] bg-white px-6 py-5">
                <a
                  href="mailto:sales@bellosbespoketiles.co.uk"
                  className="text-sm font-light text-[#1A1A1A] hover:text-[#9A7A5E] transition-colors tracking-wide"
                >
                  sales@bellosbespoketiles.co.uk
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="relative overflow-hidden bg-[#EEECE9] hidden lg:block" style={{ aspectRatio: "16 / 9" }}>
              <Image
                src="/homepage-lounge.webp"
                alt="Bellos showroom"
                fill
                className="object-cover"
              />
            </div>

          </div>

          {/* RIGHT — enquiry form */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                Send an Enquiry
              </p>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>

            <form
              action="mailto:sales@bellosbespoketiles.co.uk"
              method="POST"
              encType="text/plain"
              className="space-y-6"
            >
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    placeholder="Jane"
                    className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    placeholder="Smith"
                    className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
                  Phone <span className="text-[#C4BFB9] normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+44 7000 000 000"
                  className="w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A]"
                />
              </div>

              {/* Enquiry type */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
                  Enquiry Type
                </label>
                <div className="relative">
                  <select
                    name="enquiry_type"
                    className="appearance-none w-full border-0 border-b border-[#D4CFC8] pb-2 pt-1 pr-8 text-sm bg-transparent focus:outline-none focus:border-[#9A7A5E] cursor-pointer transition-colors text-[#1A1A1A]"
                  >
                    <option value="tiles">Tiles</option>
                    <option value="fittings">Fittings &amp; Installation</option>
                    <option value="trade">Trade Enquiry</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="pointer-events-none absolute right-0 bottom-2.5 text-[#9A7A5E]">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#9A7A5E] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your project..."
                  className="w-full border border-[#D4CFC8] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#9A7A5E] transition-colors placeholder-[#C4C0BB] text-[#1A1A1A] resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-[#1A1A1A] text-white text-xs tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200"
              >
                Send Enquiry
              </button>

              <p className="text-[10px] text-[#C4BFB9] tracking-wide text-center">
                We aim to respond within one business day.
              </p>
            </form>
          </div>

        </div>
      </div>

    </main>
  );
}
