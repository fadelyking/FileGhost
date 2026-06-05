import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      if (!userId || !plan) break;

      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
      const updates: Record<string, string | null> = {
        plan,
        stripe_customer_id: String(session.customer),
        stripe_subscription_id: subscriptionId,
        subscription_status: "active",
        updated_at: new Date().toISOString()
      };

      if (plan === "three_month_pass") {
        updates.access_expires_at = addMonths(3).toISOString();
        updates.current_period_end = updates.access_expires_at;
      }

      if (plan === "lifetime") {
        updates.access_expires_at = null;
        updates.current_period_end = null;
      }

      await supabase.from("profiles").update(updates).eq("id", userId);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const userId = subscription.metadata.user_id;
      if (!userId) break;

      const active = ["active", "trialing"].includes(subscription.status);
      await supabase
        .from("profiles")
        .update({
          plan: active ? "monthly" : "free",
          stripe_customer_id: String(subscription.customer),
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata.user_id;
      if (!userId) break;

      await supabase
        .from("profiles")
        .update({
          plan: "free",
          subscription_status: "canceled",
          current_period_end: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);
      break;
    }
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

function addMonths(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}
