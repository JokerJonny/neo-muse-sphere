import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal.functions";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
// Optional — identifies your PayPal account for attribution.
const PAYPAL_MERCHANT_ID = "ZEH6GESSELAFL";

export function PayPalCheckout({
  trackIds,
  onSuccess,
  disabled,
}: {
  trackIds: string[];
  onSuccess: () => void;
  disabled?: boolean;
}) {
  const createOrder = useServerFn(createPayPalOrder);
  const captureOrder = useServerFn(capturePayPalOrder);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4 text-center text-xs text-muted-foreground">
        PayPal is not configured yet. Add your <span className="text-accent">VITE_PAYPAL_CLIENT_ID</span> to
        enable checkout.
      </div>
    );
  }

  if (!trackIds.length) return null;

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
      <PayPalScriptProvider
        options={{
          clientId: PAYPAL_CLIENT_ID,
          currency: "USD",
          intent: "capture",
          components: "buttons",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay" }}
          disabled={disabled}
          forceReRender={[trackIds.join(","), disabled]}
          createOrder={async () => {
            try {
              const res = await createPayPalOrder({ data: { trackIds } });
              return res.orderId;
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not start PayPal checkout");
              throw e;
            }
          }}
          onApprove={async (data) => {
            try {
              const res = await capturePayPalOrder({ data: { orderId: data.orderID, trackIds } });
              if (res.fulfilled) {
                toast.success("Payment complete — downloads unlocked!");
                onSuccess();
              } else {
                toast.error("Payment was not completed. Please try again.");
              }
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not finalize payment");
            }
          }}
          onError={(err) => {
            console.error("PayPal error", err);
            toast.error("A PayPal error occurred. Please try again.");
          }}
          onCancel={() => toast.message("Checkout cancelled")}
        />
      </PayPalScriptProvider>
    </div>
  );
}
