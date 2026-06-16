import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ShoppingBag, ExternalLink, ArrowUpRight, Shirt, Loader2 } from "lucide-react";
import { GlitchText } from "@/components/GlitchText";
import { fetchPrintifyMerch } from "@/lib/merch.functions";
import {
  MERCH_FALLBACK,
  PRINTIFY_STORE_URL,
  type MerchProduct,
} from "@/lib/merch-fallback";

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [
      { title: "Merch — neoSHADE Official Store" },
      {
        name: "description",
        content:
          "Official neoSHADE merch — hoodies, tees, caps and more from the neon dark. Wear the neoUNIVERSE.",
      },
      { property: "og:title", content: "neoSHADE Official Merch" },
      {
        property: "og:description",
        content: "Cyberpunk apparel and accessories straight from the neoUNIVERSE.",
      },
    ],
  }),
  component: Merch,
});

type SortKey = "featured" | "low" | "high";

function Merch() {
  const { data, isFetching } = useQuery({
    queryKey: ["printify-merch"],
    queryFn: () => fetchPrintifyMerch(),
    initialData: MERCH_FALLBACK,
    staleTime: 1000 * 60 * 30,
    select: (live) => (live && live.length ? live : MERCH_FALLBACK),
  });

  const [sort, setSort] = useState<SortKey>("featured");

  const products = useMemo(() => {
    const list = [...(data ?? [])];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [data, sort]);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-12">
      {/* ambient neon glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent)]" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            <ShoppingBag className="h-3.5 w-3.5" /> Official Store
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-6xl">
            <GlitchText>neo</GlitchText>
            <span className="text-gradient">MERCH</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Wear the neon dark. Hoodies, tees, caps and artifacts forged from the neoUNIVERSE —
            printed on demand and shipped worldwide.
          </p>
        </div>

        <a
          href={PRINTIFY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
        >
          Visit Full Store <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Shirt className="h-4 w-4 text-accent" />
          {products.length} product{products.length === 1 ? "" : "s"}
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/60" />}
        </p>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 text-xs">
          {(
            [
              ["featured", "Featured"],
              ["low", "Price ↑"],
              ["high", "Price ↓"],
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                sort === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: MerchProduct; index: number }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/70 hover:shadow-[var(--shadow-neon)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_30%,color-mix(in_oklab,var(--accent)_18%,transparent)_50%,transparent_70%)]" />

        <span className="absolute left-3 top-3 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 font-mono text-[11px] font-semibold text-accent backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 shadow-[var(--shadow-neon)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 font-display text-sm font-bold leading-snug transition-colors group-hover:text-accent">
          {product.title}
        </h2>
        <p className="mt-auto pt-3 font-mono text-base font-bold text-primary">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </a>
  );
}
