import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { confirmCheckout } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (s: Record<string, unknown>) => ({ session_id: (s.session_id as string) || "" }),
  head: () => ({ meta: [{ title: "Purchase complete — neoSHADE" }] }),
  component: Success,
});

function Success() {
  const { session_id } = useSearch({ from: "/checkout/success" });
  const cart = useCart();
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");

  useEffect(() => {
    if (!session_id) return setStatus("fail");
    confirmCheckout({ data: { sessionId: session_id } })
      .then((r) => {
        setStatus(r.fulfilled ? "ok" : "fail");
        if (r.fulfilled) cart.clear();
      })
      .catch(() => setStatus("fail"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {status === "loading" && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
      {status === "ok" && (
        <>
          <CheckCircle2 className="h-14 w-14 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Purchase complete</h1>
          <p className="mt-2 text-muted-foreground">Your downloads are ready in your library.</p>
          <Link to="/library" className="mt-6 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-neon)]">Go to library</Link>
        </>
      )}
      {status === "fail" && (
        <>
          <h1 className="font-display text-2xl font-bold">Payment not confirmed</h1>
          <p className="mt-2 text-muted-foreground">If you were charged, your downloads will appear in your library shortly.</p>
          <Link to="/library" className="mt-6 rounded-full border border-border px-6 py-2.5 font-semibold">View library</Link>
        </>
      )}
    </div>
  );
}
