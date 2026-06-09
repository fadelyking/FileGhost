import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { PricingCards } from "@/components/pricing-cards";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/plans";

const pricingDescription =
  "Start free with 5 image metadata cleans. Upgrade to Monthly at $4.99 or get Lifetime access for $19. Remove GPS, EXIF, and hidden photo data with no subscription required.";

export const metadata: Metadata = {
  title: "Pricing - Free, Monthly & Lifetime Plans",
  description: pricingDescription,
  alternates: {
    canonical: "https://fileghost.app/pricing"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "FileGhost Pricing - Start Free, Upgrade Anytime",
    description: pricingDescription,
    url: "https://fileghost.app/pricing",
    type: "website",
    siteName: "FileGhost",
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "FileGhost - Clean hidden photo metadata before you post"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FileGhost Pricing - Start Free, Upgrade Anytime",
    description: pricingDescription,
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        alt: "FileGhost - Clean hidden photo metadata before you post"
      }
    ]
  }
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "FileGhost",
  description: "FileGhost removes hidden metadata from image files before creators post online.",
  url: "https://fileghost.app/pricing",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "5 guest cleans, plus 5 more after free signup"
    },
    {
      "@type": "Offer",
      name: "Monthly",
      price: "4.99",
      priceCurrency: "USD",
      description: "Unlimited image cleaning, billed monthly"
    },
    {
      "@type": "Offer",
      name: "Lifetime",
      price: "19",
      priceCurrency: "USD",
      description: "One-time payment, lifetime unlimited access"
    },
    {
      "@type": "Offer",
      name: "3-Month Pass",
      price: "12",
      priceCurrency: "USD",
      description: "One-time payment for 90 days of unlimited image cleaning"
    }
  ]
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://fileghost.app"
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: "https://fileghost.app/pricing"
    }
  ]
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const currentPlan = profile && hasPaidAccess(profile) ? profile.plan : undefined;

  return (
    <>
      <JsonLd data={pricingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SiteHeader />
      <main className="px-4 py-12">
        <section className="mx-auto max-w-6xl" aria-labelledby="pricing-page-heading">
          <h1 id="pricing-page-heading" className="text-4xl font-bold tracking-tight">Pricing that fits a creator workflow.</h1>
          <p className="mt-4 max-w-2xl text-white/64">
            Start with 5 free guest cleans, then create a free account to unlock 5 more.
            Upgrade to unlimited cleaning when you want a faster, repeatable pre-posting step.
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
