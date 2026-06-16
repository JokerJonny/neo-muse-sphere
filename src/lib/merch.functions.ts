import { createServerFn } from "@tanstack/react-start";
import type { MerchProduct } from "@/lib/merch-fallback";

const STORE = "https://neoshade.printify.me";

/** Storefront listing pages we scrape and union to build the catalog. */
const SOURCES = [
  `${STORE}/products`,
  `${STORE}/category/mens-clothing`,
  `${STORE}/category/womens-clothing`,
  `${STORE}/category/kids-clothing`,
  `${STORE}/category/accessories`,
  `${STORE}/category/home-and-living`,
];

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePage(html: string, into: Map<string, MerchProduct>) {
  // Each card is an <a href="/product/ID"> wrapping an <img alt=title src=image>.
  const anchor = /<a[^>]*href="(?:https:\/\/neoshade\.printify\.me)?\/product\/(\d+)"[^>]*>([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = anchor.exec(html))) {
    const id = m[1];
    const inner = m[2];
    const img = inner.match(/<img[^>]*?src="([^"]+)"/);
    const alt = inner.match(/alt="([^"]*)"/);
    const existing = into.get(id) ?? {
      id,
      title: "",
      price: 0,
      image: "",
      url: `${STORE}/product/${id}`,
    };
    if (img && !existing.image) existing.image = decode(img[1]);
    if (alt && alt[1] && !existing.title) existing.title = decode(alt[1]);
    into.set(id, existing);
  }

  // Prices ($xx.xx) attached to the most recent product id in document order.
  type Tok = { pos: number; id?: string; price?: number };
  const toks: Tok[] = [];
  const idRe = /\/product\/(\d+)"/g;
  while ((m = idRe.exec(html))) toks.push({ pos: m.index, id: m[1] });
  const priceRe = /\$(\d+\.\d{2})/g;
  while ((m = priceRe.exec(html))) toks.push({ pos: m.index, price: Number(m[1]) });
  toks.sort((a, b) => a.pos - b.pos);
  let last: string | null = null;
  for (const t of toks) {
    if (t.id) last = t.id;
    else if (t.price && last) {
      const p = into.get(last);
      if (p && !p.price) p.price = t.price;
    }
  }
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Scrapes the public neoSHADE Printify storefront and returns a unioned product
 * catalog. Returns [] on total failure so callers can fall back to the bundled snapshot.
 */
export const fetchPrintifyMerch = createServerFn({ method: "GET" }).handler(
  async (): Promise<MerchProduct[]> => {
    const pages = await Promise.all(SOURCES.map(fetchPage));
    const map = new Map<string, MerchProduct>();
    for (const html of pages) {
      if (html) parsePage(html, map);
    }
    return Array.from(map.values()).filter((p) => p.title && p.image);
  },
);
