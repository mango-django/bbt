/**
 * Branded placeholder shown when a product has no image, or its image fails to
 * load. Fills its parent (which must be `position: relative`) with the Bellos
 * cream background and wordmark — never a broken-image icon.
 */
export default function BrandedTileFallback({
  compact = false,
  label = "Image coming soon",
}: {
  /** Small variant for thumbnails — wordmark only, no subtitle/label. */
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#EEECE9] text-center select-none px-2"
      aria-hidden="true"
    >
      <span
        className={
          compact
            ? "text-[#9A7A5E] tracking-[0.2em] text-[10px] font-light"
            : "text-[#9A7A5E] tracking-[0.35em] text-sm font-light"
        }
      >
        BELLOS
      </span>
      {!compact && (
        <>
          <span className="mt-1 text-[8px] tracking-[0.3em] uppercase text-[#B8AFA4]">
            Bespoke Tiles
          </span>
          {label && (
            <span className="mt-3 text-[9px] tracking-[0.15em] uppercase text-[#C4BFB9]">
              {label}
            </span>
          )}
        </>
      )}
    </div>
  );
}
