import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import storePlaceholder from "@/assets/store-placeholder.svg";

function normalizeImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  // Allow same-origin assets
  if (trimmed.startsWith("/")) return trimmed;

  // Treat as host/path
  return `https://${trimmed}`;
}

type CouponLogoImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

/**
 * Always renders an <img> for coupon logos.
 * - Never shows text initials.
 * - Normalizes protocol-less URLs.
 * - Falls back to a non-text SVG placeholder.
 */
export function CouponLogoImage({ src, alt, className }: CouponLogoImageProps) {
  const [errored, setErrored] = useState(false);

  const normalizedSrc = useMemo(() => normalizeImageUrl(src), [src]);
  const displaySrc = !errored && normalizedSrc ? normalizedSrc : storePlaceholder;

  return (
    <img
      src={displaySrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("w-full h-full object-contain", className)}
      onError={() => setErrored(true)}
    />
  );
}
