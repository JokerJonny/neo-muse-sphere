import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const checkoutInput = (data: unknown) =>
  z.object({
    trackIds: z.array(z.string().uuid()).min(1).max(100),
    origin: z.string().url(),
  }).parse(data);

/** Create a Stripe Checkout session for one or more $0.50 track downloads. */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(checkoutInput)
  .handler(async ({ data, context }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("Stripe is not configured yet. Add STRIPE_SECRET_KEY.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tracks, error } = await supabaseAdmin
      .from("tracks")
      .select("id, title, price_cents, file_path, is_purchasable, artwork_url")
      .in("id", data.trackIds)
      .eq("is_purchasable", true);
    if (error) throw new Error(error.message);

    const buyable = (tracks ?? []).filter((t) => t.file_path);
    if (!buyable.length) throw new Error("No purchasable tracks found.");

    // Create pending purchase rows we can fulfill on success.
    const sessionRef = crypto.randomUUID();
    await supabaseAdmin.from("purchases").upsert(
      buyable.map((t) => ({
        user_id: context.userId,
        track_id: t.id,
        amount_cents: t.price_cents,
        status: "pending",
        stripe_session_id: sessionRef,
      })),
      { onConflict: "user_id,track_id" } as never,
    ).select();

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${data.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${data.origin}/cart`);
    params.set("client_reference_id", sessionRef);
    params.set("metadata[user_id]", context.userId);
    params.set("metadata[ref]", sessionRef);
    buyable.forEach((t, i) => {
      params.set(`line_items[${i}][quantity]`, "1");
      params.set(`line_items[${i}][price_data][currency]`, "usd");
      params.set(`line_items[${i}][price_data][unit_amount]`, String(t.price_cents));
      params.set(`line_items[${i}][price_data][product_data][name]`, `${t.title} (MP3)`);
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const json = (await res.json()) as { url?: string; error?: { message: string } };
    if (!res.ok || !json.url) throw new Error(json.error?.message || "Stripe checkout failed.");
    return { url: json.url };
  });

/** Confirm a returning checkout session and mark purchases completed. */
export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) throw new Error("Stripe is not configured yet.");

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(data.sessionId)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const session = (await res.json()) as {
      payment_status?: string;
      client_reference_id?: string;
      metadata?: { user_id?: string };
    };
    if (session.payment_status !== "paid") return { fulfilled: false };
    if (session.metadata?.user_id !== context.userId) throw new Error("Session mismatch.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("purchases")
      .update({ status: "completed" })
      .eq("user_id", context.userId)
      .eq("stripe_session_id", session.client_reference_id ?? "");
    return { fulfilled: true };
  });
