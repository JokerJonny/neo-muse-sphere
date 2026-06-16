import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const trackIdsInput = (data: unknown) =>
  z.object({ trackIds: z.array(z.string().uuid()).min(1).max(100) }).parse(data);

const captureInput = (data: unknown) =>
  z
    .object({
      orderId: z.string().min(1).max(200),
      trackIds: z.array(z.string().uuid()).min(1).max(100),
    })
    .parse(data);

/** Resolve the PayPal REST API base + an OAuth2 access token (read env at call time). */
async function getPayPalAuth() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  // Default to sandbox; set PAYPAL_ENV=live to switch to production.
  const base =
    process.env.PAYPAL_ENV === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  if (!clientId || !secret) {
    throw new Error("PayPal is not configured yet. Add PAYPAL_CLIENT_ID and PAYPAL_SECRET.");
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = (await res.json()) as { access_token?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || "Could not authenticate with PayPal.");
  }
  return { base, token: json.access_token };
}

/** Load purchasable tracks (with a downloadable file) for the given ids. */
async function loadBuyableTracks(trackIds: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: tracks, error } = await supabaseAdmin
    .from("tracks")
    .select("id, title, price_cents, file_path, is_purchasable")
    .in("id", trackIds)
    .eq("is_purchasable", true);
  if (error) throw new Error(error.message);
  const buyable = (tracks ?? []).filter((t) => t.file_path);
  if (!buyable.length) throw new Error("No purchasable tracks found.");
  return buyable;
}

/**
 * Create a PayPal order for one or more $0.50 track downloads.
 * Records pending purchase rows tied to the order so we can fulfil on capture.
 */
export const createPayPalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(trackIdsInput)
  .handler(async ({ data, context }) => {
    const buyable = await loadBuyableTracks(data.trackIds);
    const totalCents = buyable.reduce((sum, t) => sum + (t.price_cents || 0), 0);
    const amount = (totalCents / 100).toFixed(2);

    const { base, token } = await getPayPalAuth();

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        application_context: {
          brand_name: "neoUNIVERSE",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
              breakdown: {
                item_total: { currency_code: "USD", value: amount },
              },
            },
            items: buyable.map((t) => ({
              name: `${t.title} (MP3)`.slice(0, 127),
              quantity: "1",
              unit_amount: {
                currency_code: "USD",
                value: ((t.price_cents || 0) / 100).toFixed(2),
              },
            })),
            description: `neoUNIVERSE — ${buyable.length} track download(s)`.slice(0, 127),
          },
        ],
      }),
    });
    const order = (await orderRes.json()) as { id?: string; message?: string };
    if (!orderRes.ok || !order.id) {
      throw new Error(order.message || "Could not create PayPal order.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: upsertErr } = await supabaseAdmin.from("purchases").upsert(
      buyable.map((t) => ({
        user_id: context.userId,
        track_id: t.id,
        amount_cents: t.price_cents,
        status: "pending",
        paypal_order_id: order.id!,
      })),
      { onConflict: "user_id,track_id" },
    );
    if (upsertErr) throw new Error(upsertErr.message);

    return { orderId: order.id, amount };
  });

/**
 * Capture an approved PayPal order and unlock the downloads for the user.
 * Verifies the payment completed and the amount matches before fulfilling.
 */
export const capturePayPalOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(captureInput)
  .handler(async ({ data, context }) => {
    const buyable = await loadBuyableTracks(data.trackIds);
    const totalCents = buyable.reduce((sum, t) => sum + (t.price_cents || 0), 0);
    const expected = (totalCents / 100).toFixed(2);

    const { base, token } = await getPayPalAuth();
    const capRes = await fetch(
      `${base}/v2/checkout/orders/${encodeURIComponent(data.orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    const result = (await capRes.json()) as {
      status?: string;
      message?: string;
      purchase_units?: Array<{
        payments?: { captures?: Array<{ status?: string; amount?: { value?: string } }> };
      }>;
    };
    if (!capRes.ok) throw new Error(result.message || "PayPal capture failed.");

    const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
    const paidValue = capture?.amount?.value;
    if (result.status !== "COMPLETED" || capture?.status !== "COMPLETED") {
      return { fulfilled: false };
    }
    if (paidValue !== expected) {
      throw new Error("Payment amount mismatch.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("purchases")
      .update({ status: "completed" })
      .eq("user_id", context.userId)
      .eq("paypal_order_id", data.orderId);
    if (error) throw new Error(error.message);

    return { fulfilled: true };
  });
