import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PRICE_TO_PLAN: Record<string, "starter" | "growth" | "pro"> = {
  "price_1UHfJe1lvGtULrngRv6OF3wg": "starter",
  "price_1UHfJg1lvGtULrngEHIpBpsu": "growth",
  "price_1UHfJj1lvGtULrngHQDZaNwy": "pro",
};

function getSignatureParts(signature: string) {
  const parts: Record<string, string[]> = {};
  for (const item of signature.split(",")) {
    const [key, value] = item.split("=", 2);
    if (key && value) (parts[key] ??= []).push(value);
  }
  return parts;
}

async function verifyStripeSignature(payload: string, signature: string, secret: string) {
  const parts = getSignatureParts(signature);
  const timestamp = Number(parts.t?.[0]);
  const signatures = parts.v1 ?? [];

  if (!timestamp || !signatures.length || Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );

  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return signatures.some((candidate) => candidate === expected);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = request.headers.get("stripe-signature");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !signature || !supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const payload = await request.text();

  if (!(await verifyStripeSignature(payload, signature, webhookSecret))) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, any> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const supportedEvents = new Set([
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ]);

  if (!supportedEvents.has(event.type)) {
    return Response.json({ received: true });
  }

  const object = event.data.object;
  const metadata = object.metadata ?? {};
  const subscription =
    event.type === "checkout.session.completed"
      ? null
      : object;

  const userId =
    metadata.user_id ??
    object.client_reference_id ??
    null;

  if (!userId) {
    return Response.json({ received: true, ignored: "No user_id metadata" });
  }

  const priceId =
    subscription?.items?.data?.[0]?.price?.id ??
    subscription?.plan?.id ??
    metadata.price_id ??
    null;

  const plan = PRICE_TO_PLAN[priceId] ?? metadata.plan ?? "free";

  const row = {
    user_id: userId,
    stripe_customer_id: subscription?.customer ?? object.customer ?? null,
    stripe_subscription_id: subscription?.id ?? object.subscription ?? null,
    stripe_price_id: priceId,
    plan,
    status:
      event.type === "customer.subscription.deleted"
        ? "canceled"
        : subscription?.status ?? "active",
    current_period_end: subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
  };

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.error("Subscription sync failed:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ received: true });
});
