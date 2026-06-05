import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { PricingCards } from "@/components/pricing-cards";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for FileGhost image metadata cleaning."
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const currentPlan = profile && hasPaidAccess(profile) ? profile.plan : undefined;

  return (
    <>
      <SiteHeader />
      <main className="px-4 py-12">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight">Pricing that fits a creator workflow.</h1>
          <p className="mt-4 max-w-2xl text-white/64">
            Start with 5 free image cleans. Upgrade to unlimited cleaning when you want a faster,
            repeatable pre-posting step.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-sm text-white/60">Loading pricing...</div>}>
              <PricingCards currentPlan={currentPlan} />
            </Suspense>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Optional pay-as-you-go pricing can be enabled at $0.15 per image after free credits.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
