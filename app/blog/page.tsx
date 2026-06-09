import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Blog - Photo Privacy Guides",
  description:
    "Guides on removing metadata from photos, protecting your privacy when posting online, and understanding what data is hidden in your image files.",
  alternates: {
    canonical: "https://fileghost.app/blog"
  },
  robots: {
    index: true,
    follow: true
  }
};

const posts = [
  {
    href: "/blog/remove-metadata-before-tiktok",
    title: "How to Remove Metadata from Photos Before Posting to TikTok",
    excerpt:
      "Learn what hidden data your photos contain and how to remove GPS, camera info, and AI metadata before uploading to TikTok."
  },
  {
    href: "/blog/what-is-c2pa-metadata",
    title: "What is C2PA Metadata and How to Remove It",
    excerpt:
      "C2PA is an AI provenance standard that embeds markers in AI-generated images. Learn what C2PA metadata is and how FileGhost removes it."
  }
];

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">Photo Privacy Guides</h1>
        <p className="mt-4 max-w-2xl text-white/64">
          Learn how to protect your privacy when sharing photos online.
        </p>
        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Photo privacy guides">
          {posts.map((post) => (
            <article key={post.href} className="surface-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-mint">Guide</p>
              <h2 className="mt-3 text-xl font-semibold text-white">
                <Link href={post.href} className="hover:text-mint">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{post.excerpt}</p>
              <Link href={post.href} className="mt-4 inline-flex text-sm font-semibold text-mint hover:text-white">
                Read guide
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
