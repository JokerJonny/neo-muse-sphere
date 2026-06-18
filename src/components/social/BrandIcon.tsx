import { BRANDS, type BrandKey } from "@/lib/platforms";

type BrandIconProps = {
  brand: BrandKey;
  className?: string;
  /** size in px, defaults to 20 */
  size?: number;
};

/**
 * Renders a platform brand mark. Simple-icons render as a single SVG path
 * (using currentColor so they inherit neon theme colors); a few neoSHADE
 * properties fall back to a Lucide glyph.
 */
export function BrandIcon({ brand, className, size = 20 }: BrandIconProps) {
  const entry = BRANDS[brand];
  if (entry.kind === "simple") {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d={entry.icon.path} />
      </svg>
    );
  }
  const Icon = entry.icon;
  return <Icon width={size} height={size} className={className} aria-hidden="true" />;
}
