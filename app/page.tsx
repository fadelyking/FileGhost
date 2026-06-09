import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRight,
  Bot,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  ImageIcon,
  Lock,
  MapPin,
  MessageSquare,
  Palette,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  UploadCloud,
  Wrench,
  Zap
} from "lucide-react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { PricingCards } from "@/components/pricing-cards";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

const landingDescription =
  "FileGhost strips GPS location, camera info, EXIF data, XMP, IPTC, and AI provenance markers from your image files. Clean your photos before posting to TikTok, Instagram, or anywhere. First 5 cleans are free.";

export const metadata: Metadata = {
  title: "FileGhost - Remove Hidden Metadata from Photos Before You Post",
  description: landingDescription,
  alternates: {
    canonical: "https://fileghost.app"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "FileGhost - Remove Hidden Metadata from Photos Before You Post",
    description: landingDescription,
    url: "https://fileghost.app",
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
    title: "FileGhost - Remove Hidden Metadata from Photos Before You Post",
    description: landingDescription,
    images: [
      {
        url: "https://fileghost.app/og-image.png",
        alt: "FileGhost - Clean hidden photo metadata before you post"
      }
    ]
  }
};

const removedItems = [
  [MapPin, "GPS & location data", "Remove hidden coordinates from image files."],
  [Camera, "Camera model & device info", "Strip camera, phone, lens, and device clues."],
  [Wrench, "Software & editor tags", "Clean traces from design and editing tools."],
  [Clock, "Timestamps & history", "Reduce embedded dates and edit history."],
  [FileText, "XMP & IPTC metadata", "Remove common professional metadata formats."],
  [Bot, "AI provenance markers", "Clean C2PA/provenance markers where supported."],
  [MessageSquare, "Embedded notes & comments", "Remove hidden comments that travel with files."],
  [Palette, "Technical metadata", "Reduce color profile and file-level technical data."]
];

const audiences = [
  [Smartphone, "TikTok & Instagram Creators", "Post without leaking your location or device."],
  [Camera, "Photographers", "Share work without exposing your gear or metadata."],
  [Palette, "Designers & Editors", "Strip tool fingerprints before client delivery."],
  [Bot, "AI Image Users", "Clean generation metadata before posting."],
  [Sparkles, "Social Media Managers", "Batch-clean assets before publishing campaigns."],
  [Shield, "Privacy-Conscious Users", "For anyone who doesn't want invisible data in files."]
];

const faqs = [
  [
    "Will removing metadata stop TikTok or Instagram from labeling my content as AI?",
    "No. Platforms use many signals beyond file metadata to classify content. FileGhost removes hidden metadata from your image files, which is one layer of privacy protection. We make no guarantees about how any platform will label, rank, or process your images."
  ],
  [
    "What metadata gets removed from my photos?",
    "FileGhost removes EXIF data including GPS coordinates, camera model, device identifiers, XMP metadata, IPTC metadata, software and editor tags, editing history, timestamps, embedded notes and comments, and C2PA AI provenance markers where technically supported."
  ],
  [
    "Is my original photo file modified?",
    "No. FileGhost creates a clean copy of your file with metadata removed. Your original file is never modified and stays on your device."
  ],
  ["What image file types does FileGhost support?", "FileGhost supports JPG, JPEG, PNG, and WEBP image files."],
  [
    "Are my photos stored or shared by FileGhost?",
    "No. Files are processed privately on our server and deleted immediately after cleaning. FileGhost does not store, share, or train on user images."
  ],
  [
    "Do I need an account to remove metadata from my photos?",
    "No. Your first 5 cleans are free with no account required. Create a free account to get 5 more cleans. Upgrade to a paid plan for unlimited cleaning."
  ]
];

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FileGhost",
  url: "https://fileghost.app",
  description:
    "FileGhost removes hidden metadata from image files including GPS location, EXIF data, camera info, XMP, IPTC, and AI provenance markers (C2PA) before users post to social platforms.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web, iOS, Android",
  browserRequirements: "Requires JavaScript",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "5 guest cleans plus 5 more after free signup. No credit card required."
    },
    {
      "@type": "Offer",
      name: "Monthly",
      price: "4.99",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "4.99",
        priceCurrency: "USD",
        unitCode: "MON"
      },
      description: "Unlimited image metadata cleaning, ZIP downloads, priority processing."
    },
    {
      "@type": "Offer",
      name: "Lifetime",
      price: "19",
      priceCurrency: "USD",
      description: "One-time payment for lifetime unlimited access. No renewals."
    }
  ],
  featureList: [
    "Remove GPS location from photos",
    "Strip EXIF camera data",
    "Remove XMP metadata",
    "Remove IPTC metadata",
    "Strip C2PA AI provenance markers",
    "Remove software and editor tags",
    "Batch processing with ZIP download",
    "Files deleted after processing",
    "No training on user images"
  ]
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer
    }
  }))
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
    }
  ]
};

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/app");

  return (
    <>
      <JsonLd data={webApplicationJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SiteHeader />
      <main>
        <section className="section-pad" aria-labelledby="hero-heading">
          <div className="section-wrap grid gap-10 lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-mint">
                <Shield size={14} /> Privacy-forward image cleaner
              </div>
              <h1 id="hero-heading" className="max-w-3xl text-[34px] font-extrabold leading-[1.15] tracking-tight text-[color:var(--color-text)] md:text-[52px]">
                Your photos carry more than you think.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)]">
                FileGhost is an image metadata remover built to remove metadata from photos, strip EXIF data,
                remove GPS from photos, and clean photo metadata before you post to TikTok, Instagram,
                or anywhere else. First 5 cleans are free. No account needed.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mint px-7 py-3.5 text-base font-bold text-ink transition hover:bg-[color:var(--color-accent-hover)]"
                >
                  Clean Your First Photo Free <ArrowRight size={18} />
                </Link>
                <Link
                  href="#metadata"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-line px-6 py-3.5 font-semibold text-white/70 transition hover:border-mint hover:text-white"
                >
                  See What Gets Removed
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-5 text-xs text-white/60">
                <span className="flex items-center gap-2"><Lock size={15} className="text-mint" /> No account to try it</span>
                <span className="flex items-center gap-2"><Trash2 size={15} className="text-mint" /> Files deleted after processing</span>
                <span className="flex items-center gap-2"><Shield size={15} className="text-mint" /> No training on your images</span>
              </div>
              <p className="mt-4 text-[11px] text-[color:var(--color-text-muted)] opacity-55">
                FileGhost removes file metadata. Platforms may still classify content using other signals.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <Link
                href="/dashboard"
                className="group grid min-h-[300px] min-w-[320px] place-items-center rounded-xl border border-dashed border-line bg-panel p-8 text-center transition duration-200 ease-in-out hover:border-mint hover:bg-[color:var(--color-surface-alt)] hover:shadow-[0_0_0_1px_rgba(45,212,191,0.18)]"
              >
                <div>
                  <UploadCloud className="mx-auto text-mint" size={44} />
                  <p className="mt-5 text-lg font-semibold text-white">Drop your photo here</p>
                  <p className="mt-2 text-sm text-white/55">or tap to choose - JPG, PNG, WEBP supported</p>
                </div>
              </Link>
              <p className="mt-3 text-xs text-white/50">Your file is processed privately and deleted immediately after cleaning.</p>
              <div className="mt-4 grid gap-2 text-[13px] leading-[1.6] text-[color:var(--color-text-muted)] sm:grid-cols-2">
                {["GPS coordinates stripped", "Camera and device info removed", "Editor and software tags cleaned", "AI provenance markers removed where supported"].map((item) => (
                  <span key={item} className="flex items-center gap-2"><Check size={16} className="text-mint" /> {item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-[color:var(--color-surface-alt)] py-5" aria-label="FileGhost trust signals">
          <div className="section-wrap grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-12">
            {[
              [ImageIcon, "5 Free Cleans", "No signup required"],
              [Lock, "Private by design", "Files never stored"],
              [Zap, "Seconds per image", "No quality loss"],
              [Shield, "No AI training", "Ever, on any image"]
            ].map(([Icon, title, sub]) => {
              const ItemIcon = Icon as typeof ImageIcon;
              return (
                <div key={title as string} className="flex items-start gap-3">
                  <ItemIcon className="mt-1 shrink-0 text-mint" size={22} />
                  <div>
                    <p className="font-bold text-white">{title as string}</p>
                    <p className="text-xs text-white/55">{sub as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="metadata" className="section-pad" aria-labelledby="metadata-heading">
          <div className="section-wrap">
            <div className="max-w-3xl">
              <h2 id="metadata-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">What&apos;s hiding in your photos?</h2>
              <p className="mt-4 leading-7 text-white/65">
                Every time you take a photo, your device embeds invisible data into the file. This can include your exact GPS location, the device you used, the apps that edited it, timestamps, and more. Most people never know it&apos;s there.
              </p>
              <p className="mt-4 leading-7 text-white/65">
                When you post online, that data travels with the file. FileGhost strips it out before you share, so what you post is just the image, nothing else. It is a photo privacy tool for removing metadata before posting, cleaning image data before Instagram, and reducing hidden tags before TikTok.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {removedItems.map(([Icon, title, sub]) => {
                const RemovedIcon = Icon as typeof MapPin;
                return (
                  <div key={title as string} className="surface-card p-5 transition duration-200 ease-in-out hover:border-mint hover:bg-[color:var(--color-surface-alt)]">
                    <RemovedIcon className="text-mint" size={24} />
                    <h3 className="mt-3 text-sm font-semibold text-[color:var(--color-text)]">{title as string}</h3>
                    <p className="mt-1 text-[13px] leading-normal text-[color:var(--color-text-muted)]">{sub as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-pad bg-[color:var(--color-surface-alt)]" aria-labelledby="how-heading">
          <div className="section-wrap">
            <h2 id="how-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">Upload, clean, download.</h2>
            <div className="relative mt-8 grid gap-4 md:grid-cols-4">
              <div className="absolute left-8 right-8 top-8 hidden h-px bg-line md:block" />
              {[
                [
                  "Upload your images",
                  "Drag and drop or tap to select your JPG, PNG, or WEBP photos. Upload up to 5 images free - no account or signup required to get started."
                ],
                [
                  "We scan for hidden metadata",
                  "Our server reads every metadata field embedded in your image file, including EXIF data, GPS coordinates, XMP tags, IPTC fields, and AI provenance markers."
                ],
                [
                  "Metadata is stripped server-side",
                  "We remove hidden data during server-side re-encoding - not just flagged or hidden, but permanently stripped from the file."
                ],
                [
                  "Download your clean files",
                  "Download individual clean images or get everything as a ZIP. Your original file is never touched. Cleaned files are deleted from our server after processing."
                ]
              ].map(([title, sub], index) => (
                <div key={title} className="surface-card relative p-5">
                  <p className="text-sm font-bold text-mint">Step {index + 1}</p>
                  <h3 className="mt-3 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad" aria-labelledby="audience-heading">
          <div className="section-wrap">
            <h2 id="audience-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">Built for anyone who posts photos online.</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[color:var(--color-text-muted)]">
              Whether you are a creator, photographer, designer, or just someone who cares about what data travels
              with their images, FileGhost gives you clean files ready to post anywhere.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audiences.map(([Icon, title, sub]) => {
                const AudienceIcon = Icon as typeof Smartphone;
                return (
                  <div key={title as string} className="surface-card p-5 transition duration-200 ease-in-out hover:-translate-y-0.5 hover:border-mint hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                    <AudienceIcon className="text-mint" size={28} />
                    <h3 className="mt-4 text-sm font-semibold text-white">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{sub as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="section-pad bg-[color:var(--color-surface-alt)]" aria-labelledby="pricing-heading">
          <div className="section-wrap">
            <div className="mb-8">
              <h2 id="pricing-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">Simple pricing. Start free.</h2>
              <p className="mt-3 text-white/60">Upgrade when cleaning becomes part of your regular workflow.</p>
            </div>
            <Suspense fallback={<div className="surface-card p-5 text-sm text-white/60">Loading pricing...</div>}>
              <PricingCards />
            </Suspense>
          </div>
        </section>

        <section className="section-pad" aria-labelledby="privacy-heading">
          <div className="section-wrap">
            <h2 id="privacy-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">Privacy is the product, not the promise.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                [Lock, "Private by design", "No public file sharing. No data sold. Files are processed and deleted. We don't store your images."],
                [Eye, "Preview before you download", "See detected metadata before and after cleaning. Know exactly what was removed."],
                [Shield, "Honest about what we can't do", "Metadata removal helps file-level privacy. We can't control how platforms classify or label your content."]
              ].map(([Icon, title, sub]) => {
                const TrustIcon = Icon as typeof Lock;
                return (
                  <div key={title as string} className="surface-card p-6">
                    <TrustIcon className="text-mint" size={26} />
                    <h3 className="mt-4 font-semibold text-white">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">{sub as string}</p>
                  </div>
                );
              })}
            </div>
            <p className="mx-auto mt-6 max-w-[700px] text-center text-[15px] leading-7 text-[color:var(--color-text-muted)]">
              FileGhost was built on one principle: your image files should only contain what you choose to share.
              Every photo taken on a modern smartphone carries invisible data - your exact GPS location, the device
              you used, the apps that edited it, and in AI-generated images, provenance markers that identify how the
              image was created. FileGhost removes all of it, server-side, before you post.
            </p>
          </div>
        </section>

        <section className="section-pad bg-[color:var(--color-surface-alt)]" aria-labelledby="faq-heading">
          <div className="section-wrap max-w-4xl">
            <h2 id="faq-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">FAQ</h2>
            <div className="mt-6 overflow-hidden rounded-xl border border-line bg-panel">
              {faqs.map(([q, a]) => (
                <details key={q} className="group border-b border-line last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-white">
                    {q}
                    <ChevronDown className="shrink-0 text-mint transition group-open:rotate-180" size={18} />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-7 text-white/60">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad" aria-labelledby="blog-heading">
          <div className="section-wrap">
            <h2 id="blog-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">From the blog</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  href: "/blog/remove-metadata-before-tiktok",
                  title: "How to Remove Metadata from Photos Before Posting to TikTok",
                  excerpt: "Every photo you take on your phone contains far more than just the image."
                },
                {
                  href: "/blog/what-is-c2pa-metadata",
                  title: "What is C2PA Metadata and How to Remove It",
                  excerpt: "C2PA metadata is a form of provenance data that can travel inside AI-generated or edited images."
                }
              ].map((post) => (
                <article key={post.href} className="surface-card p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-mint">Guide</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    <Link href={post.href} className="hover:text-mint">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{post.excerpt}</p>
                  <Link href={post.href} className="mt-4 inline-flex text-sm font-semibold text-mint hover:text-white">
                    Read guide
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t-4 border-mint bg-[color:var(--color-surface-alt)] px-4 py-14 text-center" aria-labelledby="final-cta-heading">
          <div className="mx-auto max-w-3xl">
            <h2 id="final-cta-heading" className="text-[26px] font-bold tracking-tight md:text-[32px]">Clean your images before you post.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/60">
              Remove GPS, device info, and hidden file data in seconds. First 5 cleans are free - no account needed.
            </p>
            <Link
              href="/dashboard"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mint px-9 py-4 text-[17px] font-bold text-ink transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Clean Your First Photo Free <ArrowRight size={18} />
            </Link>
            <p className="mt-4 text-[11px] text-white/45">
              FileGhost removes file-level metadata. Platforms may still classify content using other signals not present in the file.
            </p>
          </div>
        </section>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 p-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex min-h-12 items-center justify-center rounded-lg bg-mint px-5 font-bold text-ink">
          Clean Your First Photo Free
        </Link>
      </div>
      <Footer />
    </>
  );
}
