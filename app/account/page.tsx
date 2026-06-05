import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BillingPortalButton, SignOutButton } from "@/components/account-actions";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { hasPaidAccess, planLabel } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Account & Billing",
  description: "Manage FileGhost account and billing."
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const profile = user ? await getProfile(user.id) : null;
  const isPaid = hasPaidAccess(profile);
  const isFree = !isPaid;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Account & billing</h1>

        {isFree ? (
          <section className="mt-8 rounded-xl border border-mint bg-[linear-gradient(135deg,#0F2027,#1A2F3A)] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-mint">You&apos;re on the free plan</p>
            <h2 className="mt-3 text-lg font-bold text-[color:var(--color-text)]">Unlock unlimited image cleaning</h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
              Clean as many images as you need. Monthly at $4.99, or pay once for Lifetime access at $19.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-mint px-6 py-3 text-sm font-bold text-ink hover:bg-[color:var(--color-accent-hover)]"
            >
              View upgrade options →
            </Link>
          </section>
        ) : null}

        <section className="mt-8 rounded-lg border border-line bg-panel p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Email" value={profile?.email || user?.email || ""} />
            <Info label="Plan" value={planLabel(profile?.plan)} />
            <Info label="Images cleaned" value={String(profile?.free_images_used || 0)} />
            {isFree ? (
              <Info label="Plan type" value="Free — no subscription required" />
            ) : (
              <Info label="Subscription status" value={humanStatus(profile?.subscription_status)} />
            )}
            {!isFree && profile?.access_expires_at ? <Info label="Access expiry" value={formatDate(profile.access_expires_at)} /> : null}
            {!isFree && profile?.current_period_end ? <Info label="Current period end" value={formatDate(profile.current_period_end)} /> : null}
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {isFree ? (
              <>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-mint px-6 py-3 font-bold text-ink focus-ring hover:bg-[color:var(--color-accent-hover)]"
                >
                  Upgrade Plan
                </Link>
                <BillingPortalButton disabled={!profile?.stripe_customer_id} variant="secondary" />
              </>
            ) : (
              <>
                <BillingPortalButton disabled={!profile?.stripe_customer_id} />
                <Link
                  href="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-transparent px-6 py-3 font-semibold text-[color:var(--color-text-muted)] focus-ring hover:border-mint hover:text-white"
                >
                  Change plan
                </Link>
              </>
            )}
            <span className="hidden h-4 w-px bg-line sm:inline-block" aria-hidden="true" />
            <SignOutButton />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-1 font-semibold">{value || "Free plan"}</p>
    </div>
  );
}

function humanStatus(value?: string | null) {
  if (!value) return "No active subscription";
  if (value === "active") return "Active";
  if (value === "trialing") return "Trialing";
  if (value === "canceled") return "Canceled";
  if (value === "past_due") return "Past due";
  return value;
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
