import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] text-[#6b6b6b] border-t border-[#e6e6e6]">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="space-y-3 text-sm">
            <h3 className="text-xs tracking-[0.2em] text-[#1c1c1c] font-[inherit]">
              CONTACT US
            </h3>
            <p>Tiles: 07498 359 060</p>
            <p>Fittings: 07718 236 035</p>
            <p>sales@bellosbespoketiles.co.uk</p>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-xs tracking-[0.2em] text-[#1c1c1c] font-[inherit]">
              CATEGORIES
            </h3>
            <Link href="/category/wall" className="block hover:text-[#1c1c1c]">
              Wall
            </Link>
            <Link href="/category/floor" className="block hover:text-[#1c1c1c]">
              Floor
            </Link>
            <Link href="/category/outdoor" className="block hover:text-[#1c1c1c]">
              Outdoor
            </Link>
            <Link href="/category/commercial" className="block hover:text-[#1c1c1c]">
              Commercial
            </Link>
            <Link href="/category/bathroom" className="block hover:text-[#1c1c1c]">
              Bathroom
            </Link>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-xs tracking-[0.2em] text-[#1c1c1c] font-[inherit]">
              EXPLORE
            </h3>
            <Link href="/faqs" className="block hover:text-[#1c1c1c]">
              FAQs
            </Link>
            <Link href="/about" className="block hover:text-[#1c1c1c]">
              About Us
            </Link>
            <Link href="/visualiser" className="block hover:text-[#1c1c1c]">
              Bellos 3D
            </Link>
            <Link href="/contact-us" className="block hover:text-[#1c1c1c]">
              Contact Us
            </Link>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="text-xs tracking-[0.2em] text-[#1c1c1c] font-[inherit]">
              CUSTOMER INFO
            </h3>
            <p>Bespoke Tile Service</p>
            <p>Delivery &amp; Returns</p>
            <p>Terms and Conditions</p>
            <p>Privacy Policy</p>
          </div>

          <div className="space-y-4 text-sm">
            <h3 className="text-xs tracking-[0.2em] text-[#1c1c1c] font-[inherit]">
              FOLLOW US
            </h3>
            <div className="flex items-center gap-4 text-[#1c1c1c]">
              <a href="#" aria-label="Instagram" className="hover:text-[#000000]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zm4.75-3.5a.75.75 0 1 1-.75.75.75.75 0 0 1 .75-.75z" />
                </svg>
              </a>
              <a href="#" aria-label="TikTok" className="hover:text-[#000000]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.7 5.2c1.1 1.2 2.5 1.9 4.1 2V9c-1.6-.1-3.1-.6-4.3-1.6v6.3a5.7 5.7 0 1 1-5.7-5.7c.2 0 .4 0 .6.1v2.9a2.8 2.8 0 1 0 2.2 2.7V3h3.1c.1.8.5 1.6 1.1 2.2z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-[#000000]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h2v5h3v-5h3l1-3h-4v-2c0-.6.4-1 1-1z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-[#000000]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.9 8.5H4V20h2.9V8.5zM5.4 4a1.7 1.7 0 1 0 0 3.4A1.7 1.7 0 0 0 5.4 4zM20 20h-2.9v-5.7c0-1.4-.5-2.3-1.8-2.3-1 0-1.6.7-1.9 1.3-.1.2-.1.6-.1.9V20H10V8.5h2.8v1.6c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.7V20z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
