import Link from "next/link";

export default function MobileVisualiserFallback() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#f5f5f5] px-6">
      <div className="max-w-md text-center bg-white rounded-2xl shadow-sm p-8 border">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900">
          3D Visualiser Not Available on Mobile
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Our interactive 3D Visualiser is currently optimised for larger
          screens to ensure the best possible experience.
        </p>

        <p className="text-gray-600 mb-6">
          Please view on <strong>desktop or iPad</strong> for the full
          interactive experience.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition"
          >
            Browse Tiles Instead
          </Link>

          <Link
            href="/contact-us"
            className="inline-block text-sm text-gray-500 hover:text-gray-700"
          >
            Need help choosing? Contact us
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Mobile version coming soon
        </p>
      </div>
    </div>
  );
}
