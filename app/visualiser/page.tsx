import Link from "next/link";

export default function VisualiserHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      {/* ===== Header ===== */}
      <h1 className="text-4xl font-bold mb-4">
        Interactive Room Visualiser
      </h1>

      <p className="text-gray-600 max-w-3xl mb-12">
        Welcome to the Bellos Interactive Hub. Explore our immersive 3D rooms,
        experiment with tiles and finishes, and bring your design ideas to life
        before you make a decision. On mobile, use touch gestures to explore
        the room.
      </p>

      {/* ===== Choose a Room ===== */}
      <h2 className="text-2xl font-semibold mb-6">
        Choose a Room
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ===== Kitchen (Available) ===== */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex">
          <div className="p-6 flex flex-col justify-between w-1/2">
            <div>
              <p className="text-xs tracking-widest text-gray-500 mb-2">
                AVAILABLE NOW
              </p>
              <h3 className="text-2xl font-semibold mb-2">
                Kitchen Visualiser
              </h3>
              <p className="text-gray-600 mb-6">
                Step into a modern kitchen and swap tiles, textures, and finishes
                in real time. Perfect for testing ideas before you renovate.
              </p>
            </div>

            <Link
              href="/visualiser/kitchen"
              className="inline-block text-center rounded-full bg-[#0f172a] text-white px-6 py-3 text-sm font-medium hover:bg-[#1e293b] transition"
            >
              Open Kitchen Visualiser
            </Link>

            <p className="text-xs text-gray-400 mt-3">
              Runs directly in your browser
            </p>
          </div>

          {/* Image */}
          <div className="w-1/2 bg-gray-200 flex items-center justify-center">
            <img
              src="/images/visualiser/kitchen-preview.webp"
              alt="Kitchen Visualiser Preview"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* ===== Bathroom (Coming Soon) ===== */}
        <ComingSoonCard
          title="Bathroom Visualiser"
          description="Soon you'll be able to explore bathroom layouts, tiles, and finishes in the same immersive way."
        />

        {/* ===== Living Room ===== */}
        <ComingSoonCard
          title="Living Room Visualiser"
          description="A warm, inviting living space visualiser to experiment with floors, wall finishes, and feature walls."
        />

        {/* ===== Bedroom ===== */}
        <ComingSoonCard
          title="Bedroom Visualiser"
          description="Visualise calming bedroom schemes with statement headboards, flooring, and subtle tile details."
        />
      </div>
    </div>
  );
}

/* --------------------------------------- */
/* Reusable Coming Soon Card */
/* --------------------------------------- */
function ComingSoonCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-gray-50 p-6 text-gray-500 flex flex-col justify-between">
      <div>
        <p className="text-xs tracking-widest mb-2">
          COMING SOON
        </p>
        <h3 className="text-2xl font-semibold mb-2">
          {title}
        </h3>
        <p className="mb-6">
          {description}
        </p>
      </div>

      <p className="text-sm text-gray-400">
        New room coming soon
      </p>
    </div>
  );
}
