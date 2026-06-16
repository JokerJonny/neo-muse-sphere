import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney, youtubeThumb } from "@/lib/format";
import { PayPalCheckout } from "@/components/PayPalCheckout";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — neoSHADE" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleSuccess() {
    cart.clear();
    navigate({ to: "/library" });
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

          {user ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Pay securely with PayPal — downloads unlock instantly.
              </p>
              <PayPalCheckout
                trackIds={cart.items.map((t) => t.id)}
                onSuccess={handleSuccess}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                toast.message("Sign in to complete your purchase");
                navigate({ to: "/auth" });
              }}
              className="w-full rounded-full bg-accent py-3 font-semibold text-accent-foreground shadow-[var(--shadow-neon)]"
            >
              Sign in to checkout
            </button>
          )}
          <p className="text-center text-xs text-muted-foreground">Secure one-time payment via PayPal ($0.50 per track). Downloads unlock instantly after purchase.</p>
        </div>
      )}
    </div>
  );
}
