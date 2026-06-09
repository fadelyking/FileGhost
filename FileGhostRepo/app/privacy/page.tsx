import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FileGhost privacy policy."
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
