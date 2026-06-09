"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Sparkles } from "lucide-react";

type PlanId = "free" | "monthly" | "three_month_pass" | "lifetime";

export const plans: Array<{
  id: PlanId;
  name: string;
  price: string;
  note: string;
  features: string[];
  cta: string;
  featured?: boolean;
  badge: string;
  noteBelow?: string;
  bestValue?: boolean;
}> = [
  {
    id: "free",
    name: "FREE",
    price: "$0",
    note: "",
    badge: "Start here",
    features: ["5 guest cleans", "5 more after free signup", "Metadata preview before download", "Individual file downloads"],
    cta: "Clean 5 Images Free"
  },
  {
    id: "monthly",
    name: "MONTHLY",
    price: "$4.99",
    note: "/mo",
    badge: "Most Popular",
    features: ["Unlimited image cleaning", "ZIP downloads", "Priority processing", "Cancel anytime"],
    cta: "Start Monthly",
    featured: true,
    noteBelow: "Less than one coffee a month"
  },
  {
    id: "lifetime",
    name: "LIFETIME",
    price: "$19",
    note: "one-time",
    badge: "Best Value",
    features: ["Everything in Monthly", "One payment, clean forever", "No renewals, no surprises", "Future features included"],
    cta: "Unlock Lifetime Access",
    bestValue: true,
    noteBelow: "Most popular with photographers & designers"
  },
  {
    id: "three_month_pass",
    name: "3-MONTH PASS",
    price: "$12",
    note: "one-time",
    badge: "No subscription",
    features: ["Unlimited for 90 days", "Good for launches or campaigns", "No auto-renewal"],
    cta: "Get 3 Months"
  }
];

export function PricingCards({ currentPlan }: { currentPlan?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const plan = searchParams.get("plan") as PlanId | null;
    if (plan && ["monthly", "three_month_pass", "lifetime"].includes(plan)) {
      void startCheckout(plan);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCheckout(plan: PlanId) {
    setError("");

    if (plan === "free") {
      router.push("/app");
      return;
    }

    setLoadingPlan(plan);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const payload = await response.json();
    setLoadingPlan(null);

    if (response.status === 401) {
      router.push(`/login?next=/pricing&plan=${plan}`);
      return;
    }

    if (!response.ok || !payload.url) {
      setError(payload.error || "Could not start checkout.");
      return;
    }

    window.location.href = payload.url;
  }

  const primaryPlans = plans.filter((plan) => plan.id !== "three_month_pass");
  const threeMonthPlan = plans.find((plan) => plan.id === "three_month_pass")!;
  const isPaidUser = Boolean(currentPlan);

  return (
    <div>
      {error ? <p className="mb-4 rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {primaryPlans.map((plan) => (
          <article
            key={plan.id}
            className={`relative rounded-lg border p-5 ${
              plan.featured
                ? "border-mint bg-panel shadow-glow"
                : plan.bestValue
                  ? "border-[#F59E0B] bg-panel shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                  : "border-line bg-panel"
            }`}
          >
            {currentPlan === plan.id ? (
              <div className="absolute right-4 top-4 rounded-full border border-mint bg-[color:var(--color-surface-alt)] px-2 py-0.5 text-[11px] text-mint">
                Your current plan
              </div>
            ) : null}
            <div className={`mb-4 inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${
              plan.bestValue ? "bg-[#F59E0B] text-ink" : plan.featured ? "bg-mint text-ink" : "bg-white/[0.08] text-white/70"
            }`}>
              {plan.featured || plan.bestValue ? <Sparkles size={13} /> : null}
              {plan.badge}
            </div>
            <h3 className="text-lg font-semibold tracking-wide">{plan.name}</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
              {plan.note ? <span className="pb-1 text-sm text-white/55">{plan.note}</span> : null}
            </div>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="mt-0.5 shrink-0 text-mint" size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            {!isPaidUser ? (
              <button
                type="button"
                onClick={() => void startCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-70 ${
                  plan.featured ? "bg-mint text-ink hover:bg-white" : "bg-white text-ink hover:bg-mint"
                }`}
              >
                {loadingPlan === plan.id ? <Loader2 className="animate-spin" size={16} /> : null}
                {plan.cta}
              </button>
            ) : null}
            {plan.noteBelow ? <p className="mt-2 text-center text-[11px] text-white/45">{plan.noteBelow}</p> : null}
          </article>
        ))}
      </div>
      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-4 rounded-[10px] border border-line bg-[color:var(--color-surface-alt)] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text-muted)]">Also available</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[color:var(--color-text)]">3-Month Pass</h3>
            {currentPlan === threeMonthPlan.id ? (
              <span className="rounded-full border border-mint bg-[color:var(--color-surface-alt)] px-2 py-0.5 text-[11px] text-mint">Your current plan</span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-[color:var(--color-text-muted)]">Unlimited for 90 days — $12 one-time, no renewal</p>
        </div>
        {!isPaidUser ? (
          <button
            type="button"
            onClick={() => void startCheckout(threeMonthPlan.id)}
            disabled={loadingPlan === threeMonthPlan.id}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line px-5 text-sm font-semibold text-[color:var(--color-text-muted)] hover:border-mint hover:text-[color:var(--color-text)] disabled:opacity-70"
          >
            {loadingPlan === threeMonthPlan.id ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
            Get 3 Months
          </button>
        ) : null}
      </div>
      <p className="mt-5 text-center text-xs text-white/50">
        All plans use Stripe for secure payment. No hidden fees. <Link href="/app" className="text-mint hover:text-white">Clean 5 images free.</Link>
      </p>
    </div>
  );
}
