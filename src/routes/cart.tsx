import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney } from "@/lib/format";
import { youtubeThumb } from "@/lib/format";
import { createCheckout } from "@/lib/checkout.functions";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — neoSHADE" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (!user) {
      toast.message("Sign in to complete your purchase");
      return navigate({ to: "/auth" });
    }
    setBusy(true);
    try {
      const res = await createCheckout({
        data: { trackIds: cart.items.map((t) => t.id), origin: window.location.origin },
      });
      if (res.url) window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Cart</h1>

      {!cart.items.length ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-12 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/catalog" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Browse catalog</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {cart.items.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <img src={t.artwork_url || youtubeThumb(t.youtube_id) || ""} alt="" className="h-14 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.artist}</p>
              </div>
              <span className="font-semibold">{formatMoney(t.price_cents)}</span>
              <button onClick={() => cart.remove(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="font-display text-xl text-gradient">{formatMoney(cart.totalCents)}</span>
          </div>

          <button onClick={checkout} disabled={busy} className="w-full rounded-full bg-accent py-3 font-semibold text-accent-foreground shadow-[var(--shadow-neon)] disabled:opacity-60">
            {busy ? "Redirecting to checkout…" : "Checkout securely"}
          </button>
          <p className="text-center text-xs text-muted-foreground">Secure one-time payment via Stripe. Downloads unlock instantly after purchase.</p>
        </div>
      )}
    </div>
  );
}
