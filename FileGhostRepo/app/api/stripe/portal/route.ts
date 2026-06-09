import { NextResponse } from "next/server";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to manage billing." }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing profile found yet." }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/account`
  });

  return NextResponse.json({ url: session.url });
}
