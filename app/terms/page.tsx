import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Terms",
  description: "FileGhost terms of service."
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">Terms</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-white/68">
          <p>
            FileGhost provides image metadata cleaning tools for privacy and file hygiene. You are
            responsible for the images you upload and how you use cleaned files.
          </p>
          <p>
            The service must not be used to violate platform rules, laws, contracts, or third-party
            rights. FileGhost does not promise that cleaned images will avoid labels, filters, ranking
            systems, or platform enforcement.
          </p>
          <p>
            Paid access is managed through Stripe. Subscriptions renew unless canceled. One-time
            passes provide access for the stated period or lifetime unlock shown at checkout.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
