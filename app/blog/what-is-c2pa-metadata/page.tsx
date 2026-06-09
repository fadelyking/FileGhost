import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";

const title = "What is C2PA Metadata and How to Remove It";
const description =
  "C2PA is an AI provenance standard that embeds markers in AI-generated images. Learn what C2PA metadata is and how FileGhost removes it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://fileghost.app/blog/what-is-c2pa-metadata"
  },
  robots: {
    index: true,
    follow: true
  }
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url: "https://fileghost.app/blog/what-is-c2pa-metadata",
  publisher: {
    "@type": "Organization",
    name: "FileGhost",
    url: "https://fileghost.app"
  },
  datePublished: "2026-06-10",
  dateModified: "2026-06-10"
};

export default function C2paMetadataGuidePage() {
  return (
    <>
      <JsonLd data={articleJsonLd} />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <article className="space-y-7 text-sm leading-7 text-white/68">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-mint">Guide</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">{title}</h1>
          </header>

          <section aria-labelledby="what-is-c2pa">
            <h2 id="what-is-c2pa" className="text-2xl font-bold tracking-tight text-white">What is C2PA?</h2>
            <p className="mt-3">
              C2PA is a standard for adding provenance information to digital media. In plain language, it can attach
              a record to an image that says where the image came from, what tool created it, or what edits were made.
              This record is often called content credentials. For AI-generated images, C2PA metadata can act as an
              embedded history of how the file was produced.
            </p>
          </section>

          <section aria-labelledby="tools-that-add-c2pa">
            <h2 id="tools-that-add-c2pa" className="text-2xl font-bold tracking-tight text-white">Which tools add C2PA metadata to images?</h2>
            <p className="mt-3">
              Some AI image generators, editing tools, camera apps, and creative suites can add C2PA provenance markers
              or other AI metadata to image files. The exact behavior depends on the tool, export settings, file type,
              and platform. Most people never see these markers because they are stored inside the file rather than
              displayed on the image.
            </p>
          </section>

          <section aria-labelledby="can-remove-c2pa">
            <h2 id="can-remove-c2pa" className="text-2xl font-bold tracking-tight text-white">Can you remove C2PA metadata?</h2>
            <p className="mt-3">
              In many cases, yes. An AI metadata remover can strip C2PA metadata by re-encoding the image and avoiding
              metadata preservation. FileGhost is built to remove C2PA, EXIF, XMP, IPTC, GPS data, and editor tags where
              technically supported. Some provenance structures are more complex, so no web tool should promise perfect
              removal for every possible file.
            </p>
          </section>

          <section aria-labelledby="how-fileghost-removes">
            <h2 id="how-fileghost-removes" className="text-2xl font-bold tracking-tight text-white">How FileGhost removes C2PA metadata</h2>
            <p className="mt-3">
              FileGhost processes images server-side. It reads the uploaded file, checks for common metadata markers,
              then creates a clean copy through image re-encoding. The clean copy is what you download. Your original
              file stays on your device, and cleaned files are deleted after processing.
            </p>
          </section>

          <section aria-labelledby="platform-detection">
            <h2 id="platform-detection" className="text-2xl font-bold tracking-tight text-white">Does removing C2PA metadata affect platform detection?</h2>
            <p className="mt-3">
              Removing C2PA provenance markers can reduce file-level metadata, but platforms may use many other signals
              to classify content. Those signals can include upload history, account behavior, visual analysis, edits,
              compression patterns, and internal platform systems. FileGhost does not guarantee that removing metadata
              will change how a platform labels or ranks an image.
            </p>
          </section>

          <section aria-labelledby="remove-c2pa-free">
            <h2 id="remove-c2pa-free" className="text-2xl font-bold tracking-tight text-white">How to remove C2PA metadata for free</h2>
            <p className="mt-3">
              To remove C2PA metadata, upload a JPG, PNG, or WEBP image to FileGhost, clean the file, and download the
              new copy. Your first 5 cleans are free with no account needed. You can{" "}
              <Link href="/" className="text-mint hover:text-white">remove metadata from your photos for free</Link>{" "}
              before posting them anywhere.
            </p>
            <p className="mt-3">
              If you are posting to TikTok, you may also want our guide on{" "}
              <Link href="/blog/remove-metadata-before-tiktok" className="text-mint hover:text-white">removing metadata before TikTok</Link>.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
