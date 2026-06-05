import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { UploadCleaner } from "@/components/upload-cleaner";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { FREE_IMAGE_LIMIT, getPlanAccess } from "@/lib/plans";

export const metadata: Metadata = {
  title: "App",
  description: "Clean and download private image files."
};

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const user = await getCurrentUser();

  const profile = user ? await getProfile(user.id) : null;
  const usage = user
    ? getPlanAccess(profile)
    : {
        freeUsed: 0,
        freeLimit: FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: FREE_IMAGE_LIMIT,
        paid: false
      };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm text-white/65">
          Files are processed privately and intended to be deleted after processing. No training. No
          public sharing. Metadata removal does not guarantee how platforms classify content.
        </div>

        <UploadCleaner initialUsage={usage} isLoggedIn={Boolean(user)} />
      </main>
      <Footer />
    </>
  );
}
