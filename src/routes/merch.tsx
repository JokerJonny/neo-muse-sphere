import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Shirt, ShoppingBag, Sticker, Coffee, Package, Truck } from "lucide-react";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [
      { title: "Merch Store — neoSHADE" },
      {
        name: "description",
        content:
          "Shop official neoSHADE merch — apparel, accessories, prints and more. Physical products fulfilled via Printify, separate from the digital music store.",
      },
      { property: "og:title", content: "neoSHADE Merch Store" },
      {
        property: "og:description",
        content: "Official neoSHADE physical merch — apparel, accessories, prints and more.",
      },
    ],
  }),
  component: Merch,
});

const CATEGORIES = [
  { label: "Apparel", desc: "Tees, hoodies & more", icon: Shirt },
  { label: "Accessories", desc: "Bags, hats & gear", icon: ShoppingBag },
  { label: "Stickers", desc: "Neon decals & packs", icon: Sticker },
  { label: "Drinkware", desc: "Mugs & bottles", icon: Coffee },
];

function Merch() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Store switch banner */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-2 text-sm">
        <a
          href="/catalog"
          className="rounded-lg px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          🎵 Music Store
        </a>
        <span className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground shadow-[var(--shadow-neon)]">
          🛍️ Merch Store
        </span>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          Two separate stores — digital music vs. physical merch.
        </span>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-background to-card p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Package className="h-3.5 w-3.5" /> Physical Merch
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl text-gradient">
            neoSHADE Merch Store
          </h1>
          <p className="mt-3 text-muted-foreground">
            Wear the neon dark. Official {BRAND.universe} apparel, accessories and prints —
            printed on demand and shipped worldwide via Printify. This is{" "}
            <span className="text-foreground">separate from the digital music store</span>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={BRAND.merchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4" /> Shop Full Merch Store
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary"
            >
              🎵 Go to Music Store
            </a>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-10">
        <h2 className="font-display text-2xl font-bold">Browse Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap any category to open the full collection on the Printify store.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <a
              key={c.label}
              href={BRAND.merchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-neon)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 opacity-0 transition-opacity group-hover:opacity-10" />
              <c.icon className="h-8 w-8 text-accent transition-transform group-hover:scale-110" />
              <h3 className="mt-4 font-display text-lg font-bold">{c.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Shop now <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Info strip */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <InfoCard icon={Truck} title="Worldwide Shipping" desc="Printed on demand and delivered globally." />
        <InfoCard icon={Package} title="Premium Quality" desc="Durable apparel and accessories built to last." />
        <InfoCard icon={ShoppingBag} title="Secure Checkout" desc="Purchases handled on the official Printify storefront." />
      </div>

      <p className="mt-10 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Looking for music?{" "}
        <a href="/catalog" className="font-semibold text-primary hover:underline">
          Visit the Music Store
        </a>{" "}
        for digital MP3 downloads at $0.50 per track.
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Truck;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5">
      <Icon className="h-6 w-6 text-primary" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
