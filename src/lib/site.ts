import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/**
 * Production fallback origin. Used during build-time prerender or when the
 * request host can't be determined. At runtime (SSR + client) the actual
 * deployed host is detected automatically, so previews resolve to the preview
 * domain and production resolves to the production domain.
 */
export const PROD_ORIGIN = "https://universe.neo-shade.com";

/**
 * Resolve the origin of the current deployment.
 * - Server (SSR): derived from the incoming request host (honoring proxy headers).
 * - Client: window.location.origin.
 * Falls back to PROD_ORIGIN when no host is available.
 */
export const getSiteOrigin = createIsomorphicFn()
  .server((): string => {
    try {
      const url = getRequestUrl({ xForwardedHost: true, xForwardedProto: true });
      if (url?.origin && !url.origin.includes("localhost") && !url.origin.includes("127.0.0.1")) {
        return url.origin;
      }
    } catch {
      // No request context (e.g. build-time prerender) — fall through.
    }
    return PROD_ORIGIN;
  })
  .client((): string => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    return PROD_ORIGIN;
  });

/** Build an absolute URL for the current deployment. */
export function siteUrl(path = "/"): string {
  const origin = getSiteOrigin();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
