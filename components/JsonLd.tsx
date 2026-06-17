/**
 * Renders a JSON-LD <script> for structured data (SEO rich results).
 * Pass any schema.org object as `data`.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
