export function createProductSlug(
  title: string,
  dimensionString: string
) {
  return `${title} ${dimensionString}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
