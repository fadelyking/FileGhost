import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, stripePriceMap } from "@/lib/stripe";

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["monthly", "three_month_pass", "lifetime"])
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in before checkout." }, { status: 401 });
  }

  const plan = parsed.data.plan;
  const price = stripePriceMap[plan];
  if (!price) {
    return NextResponse.json({ error: "Stripe price ID is missing for this plan." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const stripe = getStripe();
  const supabase = createAdminClient();
  const profile = await getProfile(user.id);

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email || undefined,
      metadata: { user_id: user.id }
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: plan === "monthly" ? "subscription" : "payment",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    metadata: {
      user_id: user.id,
      plan
    },
    subscription_data:
      plan === "monthly"
        ? {
            metadata: {
              user_id: user.id,
              plan
            }
          }
        : undefined
  });

  return NextResponse.json({ url: session.url });
}
