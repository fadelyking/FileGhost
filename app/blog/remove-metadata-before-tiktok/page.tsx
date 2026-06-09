import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";

const title = "How to Remove Metadata from Photos Before Posting to TikTok";
const description =
  "Learn what hidden data your photos contain and how to remove GPS, camera info, and AI metadata before uploading to TikTok.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://fileghost.app/blog/remove-metadata-before-tiktok"
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
  url: "https://fileghost.app/blog/remove-metadata-before-tiktok",
  publisher: {
    "@type": "Organization",
    name: "FileGhost",
    url: "https://fileghost.app"
  },
  datePublished: "2026-06-10",
  dateModified: "2026-06-10"
};

export default function TikTokMetadataGuidePage() {
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

          <p>
            Every photo you take on your phone contains far more than just the image. Embedded invisibly in the file is
            your exact GPS location, the camera or device model you used, the date and time the photo was taken, and if
            the image was created or edited with AI tools, provenance markers that can identify how it was made.
          </p>
          <p>
            When you upload that photo to TikTok, the full file is what gets sent. This guide explains what metadata is,
            why it matters, and how to remove metadata from photos before posting.
          </p>

          <section aria-labelledby="what-is-photo-metadata">
            <h2 id="what-is-photo-metadata" className="text-2xl font-bold tracking-tight text-white">What is photo metadata?</h2>
            <p className="mt-3">
              Photo metadata is hidden information stored inside an image file. EXIF data can include camera settings,
              device model, lens details, dates, and GPS coordinates. XMP and IPTC data can include editing software,
              captions, copyright fields, comments, and workflow notes. You usually cannot see this data by looking at
              the image, but it can still travel with the file when you post or share it.
            </p>
          </section>

          <section aria-labelledby="what-tiktok-receives">
            <h2 id="what-tiktok-receives" className="text-2xl font-bold tracking-tight text-white">What metadata does TikTok receive when you upload a photo?</h2>
            <p className="mt-3">
              TikTok receives the image file you upload, and that file may include embedded metadata. TikTok controls how
              it handles that data. FileGhost helps by removing file-level metadata before you upload, but it does not
              guarantee how TikTok will label, rank, moderate, or process any content.
            </p>
          </section>

          <section aria-labelledby="c2pa-tiktok">
            <h2 id="c2pa-tiktok" className="text-2xl font-bold tracking-tight text-white">What is C2PA metadata and does it affect TikTok?</h2>
            <p className="mt-3">
              C2PA metadata is provenance information that some AI image tools embed inside files. It can describe where
              an image came from, what tool created it, or whether content credentials are attached. FileGhost removes
              C2PA metadata where technically supported, but removing C2PA metadata does not guarantee how TikTok or any
              other platform will classify content. For more detail, read our guide to{" "}
              <Link href="/blog/what-is-c2pa-metadata" className="text-mint hover:text-white">what C2PA metadata is</Link>.
            </p>
          </section>

          <section aria-labelledby="how-to-remove">
            <h2 id="how-to-remove" className="text-2xl font-bold tracking-tight text-white">How to remove metadata from photos before posting</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Go to fileghost.app.</li>
              <li>Drop your photo into the upload zone.</li>
              <li>Click Clean.</li>
              <li>Download your clean file.</li>
              <li>Upload the clean file to TikTok.</li>
            </ol>
            <p className="mt-3">
              You can <Link href="/" className="text-mint hover:text-white">remove metadata from your photos for free</Link> with FileGhost. No account is needed for the first 5 cleans.
            </p>
          </section>

          <section aria-labelledby="tiktok-faq">
            <h2 id="tiktok-faq" className="text-2xl font-bold tracking-tight text-white">Frequently asked questions</h2>
            <h3 className="mt-4 font-semibold text-white">Does removing metadata stop TikTok from labeling my content?</h3>
            <p>No. Platforms use many signals beyond file metadata, so there is no guarantee.</p>
            <h3 className="mt-4 font-semibold text-white">Is it free to remove metadata from photos?</h3>
            <p>Yes. Your first 5 image cleans are free.</p>
            <h3 className="mt-4 font-semibold text-white">Does FileGhost store my photos?</h3>
            <p>No. Files are processed privately and deleted after processing.</p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
