import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { UploadCleaner } from "@/components/upload-cleaner";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { GUEST_FREE_IMAGE_LIMIT, getPlanAccess } from "@/lib/plans";

export const metadata: Metadata = {
  title: "App",
  description: "Clean and download private image files.",
  robots: {
    index: false,
    follow: false
  }
};

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const user = await getCurrentUser();

  const profile = user ? await getProfile(user.id) : null;
  const usage = user
    ? getPlanAccess(profile)
    : {
        freeUsed: 0,
        freeLimit: GUEST_FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: GUEST_FREE_IMAGE_LIMIT,
        paid: false
      };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm text-white/65">
          Files processed privately and deleted after cleaning. No training. No public sharing.
        </div>

        <UploadCleaner initialUsage={usage} isLoggedIn={Boolean(user)} />
      </main>
      <Footer />
    </>
  );
}
