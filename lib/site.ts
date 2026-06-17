// Canonical site identity used for SEO (sitemap, robots, canonical URLs,
// Open Graph, JSON-LD). These URLs MUST be the public production domain — never
// localhost — so we ignore a localhost NEXT_PUBLIC_SITE_URL and fall back to the
// real domain.

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const SITE_URL =
  envUrl && !envUrl.includes("localhost")
    ? envUrl
    : "https://bellosbespoketiles.co.uk";

export const SITE_NAME = "Bellos Bespoke Tiles";

export const SITE_DESCRIPTION =
  "Premium bespoke tiles delivered across the UK — porcelain, ceramic, natural stone, outdoor & wood-effect tiles, plus a 3D room visualiser.";
