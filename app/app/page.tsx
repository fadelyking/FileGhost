import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { UploadCleaner } from "@/components/upload-cleaner";
import { getCurrentUser, getProfile } from "@/lib/auth";
import { getPlanAccess } from "@/lib/plans";

export const metadata: Metadata = {
  title: "App",
  description: "Clean and download private image files."
};

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const profile = await getProfile(user.id);
  const usage = getPlanAccess(profile);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm text-white/65">
          Files are processed privately and intended to be deleted after processing. No training. No
          public sharing. Metadata removal does not guarantee how platforms classify content.
        </div>

        <UploadCleaner initialUsage={usage} isLoggedIn />
      </main>
      <Footer />
    </>
  );
}
