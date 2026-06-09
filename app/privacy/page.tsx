import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

const privacyDescription =
  "FileGhost processes images privately. Files are deleted after cleaning. No training on user images. No public sharing. Read our full privacy policy.";

export const metadata: Metadata = {
  title: "Privacy Policy — FileGhost",
  description: privacyDescription,
  alternates: {
    canonical: "https://fileghost.app/privacy"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "Privacy Policy — FileGhost",
    description: privacyDescription,
    url: "https://fileghost.app/privacy",
    type: "website",
    siteName: "FileGhost",
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "FileGhost — Clean hidden photo metadata before you post"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — FileGhost",
    description: privacyDescription,
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        alt: "FileGhost — Clean hidden photo metadata before you post"
      }
    ]
  }
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-white/68">
          <p>
            FileGhost is designed to clean image metadata without turning user files into public
            content. Uploaded images are processed to remove hidden metadata and are intended to be
            deleted after processing or expiry.
          </p>
          <p>
            We do not train AI models on user images, sell uploaded images, or publicly share files.
            We store account, billing, usage, and processing records needed to operate the service.
          </p>
          <p>
            Payment data is handled by Stripe. Authentication and app records are handled with
            Supabase. You can request account deletion by contacting support.
          </p>
          <p>
            Metadata removal improves file privacy, but it does not guarantee how social platforms,
            marketplaces, or other services classify or moderate content.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
