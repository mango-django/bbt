import Link from "next/link";

type LegalPageProps = {
  title: string;
  /** Short label shown in the breadcrumb (defaults to title) */
  breadcrumb?: string;
  /** e.g. "17 June 2026" */
  lastUpdated?: string;
  children: React.ReactNode;
};

/**
 * Shared shell for static legal / policy pages (Privacy, Terms,
 * Delivery & Returns). Matches the About / Contact aesthetic:
 * cream background, breadcrumb, restrained serif-ish hierarchy.
 *
 * Use the exported `Section` and `Lead` helpers for consistent prose.
 */
export default function LegalPage({
  title,
  breadcrumb,
  lastUpdated,
  children,
}: LegalPageProps) {
  return (
    <main className="bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link
              href="/"
              className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">{breadcrumb ?? title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-14 pb-2">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#9A7A5E] mb-4">
          Bellos Bespoke Tiles
        </p>
        <h1 className="text-3xl sm:text-4xl font-light tracking-wide">
          {title}
        </h1>
        {lastUpdated && (
          <p className="mt-4 text-xs tracking-[0.15em] uppercase text-[#9A9A9A]">
            Last updated: {lastUpdated}
          </p>
        )}
        <div className="w-10 h-px bg-[#D4CFC8] mt-6" />
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20 pt-8">
        <div className="space-y-10">{children}</div>
      </div>
    </main>
  );
}

/** A titled section block. */
export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-medium tracking-wide text-[#1A1A1A]">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#4a4a4a] [&_a]:text-[#9A7A5E] [&_a:hover]:text-[#7A5E44] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#1A1A1A] [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}

/** Intro paragraph under the title. */
export function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-relaxed text-[#4a4a4a]">{children}</p>
  );
}
