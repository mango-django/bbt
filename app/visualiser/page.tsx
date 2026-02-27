import Link from "next/link";

export default function VisualiserHubPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* Breadcrumb */}
      <div className="border-b border-[#E8E5E0] bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-4">
          <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase">
            <Link href="/" className="text-[#9A7A5E] hover:text-[#7A5E44] transition-colors">
              Home
            </Link>
            <span className="text-[#D4CFC8]">/</span>
            <span className="text-[#1A1A1A]">Visualiser</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-2">
            Design Tool
          </p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-[#1A1A1A] mb-4">
            Interactive Room Visualiser
          </h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Explore immersive 3D rooms, experiment with tiles and finishes, and bring your design ideas to life before you decide.
          </p>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] font-medium shrink-0">
            Choose a Room
          </p>
          <div className="flex-1 h-px bg-[#E8E5E0]" />
        </div>

        {/* Bathroom card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="border border-[#E8E5E0] bg-white overflow-hidden flex flex-col sm:flex-row">
            {/* Image */}
            <div className="w-full sm:w-2/5 overflow-hidden bg-[#EEECE9]" style={{ minHeight: "220px" }}>
              <img
                src="/hero-bathroom.webp"
                alt="Bathroom Visualiser Preview"
                className="w-full h-full object-cover"
                style={{ minHeight: "220px" }}
              />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex flex-col justify-between sm:w-3/5">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A7A5E] mb-2">
                  Available Now
                </p>
                <h2 className="text-xl sm:text-2xl font-light tracking-wider text-[#1A1A1A] mb-3">
                  Bathroom Visualiser
                </h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  Explore bathroom layouts and finishes, and swap tiles to test ideas before you renovate.
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/visualiser/bathroom"
                  className="inline-block w-full text-center py-4 bg-[#1A1A1A] text-white text-xs tracking-[0.3em] uppercase hover:bg-[#2A2A2A] transition-colors duration-200"
                >
                  Open Bathroom Visualiser
                </Link>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#C4BFB9] mt-3 text-center">
                  Runs directly in your browser
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* More rooms coming soon */}
        <div className="border border-dashed border-[#D4CFC8] bg-white px-8 py-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#9A7A5E] mb-3">
            Coming Soon
          </p>
          <p className="text-lg font-light tracking-wider text-[#1A1A1A] mb-2">
            More Rooms on the Way
          </p>
          <p className="text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
            We're working on living room, bedroom, and kitchen visualisers. Check back soon to bring your whole home to life.
          </p>
        </div>

      </div>
    </div>
  );
}
