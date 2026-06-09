import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true
  });
}

export const stripePriceMap = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  three_month_pass: process.env.STRIPE_THREE_MONTH_PRICE_ID,
  lifetime: process.env.STRIPE_LIFETIME_PRICE_ID
} as const;
