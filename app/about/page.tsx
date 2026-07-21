import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story behind Bellos Bespoke Tiles — a UK retailer of premium porcelain, ceramic and natural stone tiles, delivered nationwide.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
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
            <span className="text-[#1A1A1A]">About</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <Image
          src="/hero-bathroom.webp"
          alt="Bellos showroom"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/60 mb-4">
            Est. London, UK
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-wider leading-tight">
            Bellos Bespoke Tiles
          </h1>
          <div className="w-10 h-px bg-white/40 mt-6" />
        </div>
      </div>

      {/* Intro — centred pull quote */}
      <div className="max-w-[800px] mx-auto px-6 sm:px-8 py-16 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#9A7A5E] mb-5">
          Our Story
        </p>
        <p className="text-xl sm:text-2xl font-light text-[#1A1A1A] leading-relaxed tracking-wide">
          We're passionate about helping you bring your vision to life with the perfect finish — from high-grade premium tiles to cost-effective options that never compromise on style or quality.
        </p>
      </div>

      {/* Split — Story + Image */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-[#E8E5E0]">

          {/* Image */}
          <div className="relative overflow-hidden bg-[#EEECE9]" style={{ minHeight: "460px" }}>
            <Image
              src="/homepage-lounge.webp"
              alt="Bellos tile installation"
              fill
              className="object-cover"
            />
          </div>

          {/* Text */}
          <div className="bg-white px-8 sm:px-12 py-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
                25 Years of Experience
              </p>
              <div className="flex-1 h-px bg-[#E8E5E0]" />
            </div>

            <div className="space-y-5 text-sm text-[#6B6B6B] leading-relaxed">
              <p>
                With a combined 25 years of tiling and fitting experience, our owners bring deep industry knowledge, precision craftsmanship, and a truly professional service to every customer interaction. This expertise ensures you receive guidance that's practical, trustworthy, and tailored to your project.
              </p>
              <p>
                What sets us apart isn't just our competitive prices, but the strong, long-standing relationships we've built with reputable international manufacturers. These partnerships allow us to bring you exclusive ranges you won't find anywhere else, alongside timeless classics suited to every space and budget.
              </p>
              <p>
                Whether you're a homeowner, interior designer, or contractor, we take pride in delivering both exceptional choice and exceptional value.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="border-t border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E5E0]">

            <div className="text-center px-8 py-8 sm:py-0">
              <p className="text-4xl font-light text-[#1A1A1A] mb-2">25<span className="text-[#9A7A5E]">+</span></p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-3">Years Experience</p>
              <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-[180px] mx-auto">
                Combined industry expertise in tiling, fitting, and specification.
              </p>
            </div>

            <div className="text-center px-8 py-8 sm:py-0">
              <p className="text-4xl font-light text-[#1A1A1A] mb-2">1000<span className="text-[#9A7A5E]">+</span></p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-3">Products</p>
              <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-[180px] mx-auto">
                One of the widest tile ranges in the UK, from statement to classic.
              </p>
            </div>

            <div className="text-center px-8 py-8 sm:py-0">
              <p className="text-4xl font-light text-[#1A1A1A] mb-2">UK<span className="text-[#9A7A5E]"> ·</span></p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-3">London Based</p>
              <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-[180px] mx-auto">
                Serving homeowners, designers, and contractors across the country.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Image grid */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
            Our Range
          </p>
          <div className="flex-1 h-px bg-[#E8E5E0]" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { src: "/featured-1.jpg", label: "Premium Marble" },
            { src: "/featured-2.jpg", label: "Stone Effect" },
            { src: "/featured-3.jpg", label: "Natural Porcelain" },
            { src: "/featured-4.jpg", label: "Classic Ceramic" },
          ].map(({ src, label }) => (
            <div key={src} className="relative overflow-hidden bg-[#EEECE9] group" style={{ aspectRatio: "1 / 1" }}>
              <Image
                src={src}
                alt={label}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-[#1A1A1A]/20 group-hover:bg-[#1A1A1A]/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/50 mb-2">Ready to start?</p>
            <p className="text-2xl sm:text-3xl font-light tracking-wider">Find your perfect tile.</p>
          </div>
          <Link
            href="/tiles"
            className="shrink-0 px-10 py-4 border border-white/30 text-[10px] tracking-[0.3em] uppercase text-white hover:bg-white hover:text-[#1A1A1A] transition-colors duration-300"
          >
            Browse All Tiles
          </Link>
        </div>
      </div>

    </main>
  );
}
