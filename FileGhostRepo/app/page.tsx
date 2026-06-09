import Link from "next/link";
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
import { PricingCards } from "@/components/pricing-cards";
import { SiteHeader } from "@/components/site-header";

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
    "Will this stop TikTok or Instagram from labeling my content as AI?",
    "No — and we'll be direct about that. Platforms use many signals beyond file metadata to classify content. FileGhost removes hidden metadata from your image files, which is one layer of that. We make no guarantees about how any platform will label, rank, or process your images."
  ],
  [
    "What exactly gets removed from my files?",
    "We remove EXIF data such as camera, device, and GPS details, plus XMP and IPTC metadata, software and editor tags, editing history, embedded notes, and C2PA/AI provenance markers where technically supported."
  ],
  [
    "Is my original file kept or replaced?",
    "Your original file is never modified. We create a clean copy, which you download. Your original stays on your device."
  ],
  ["What file types are supported?", "JPG, JPEG, PNG, and WEBP. File size limits apply to keep processing fast."],
  [
    "Are my photos safe? Do you store them?",
    "Files are processed privately on our server and deleted after processing. We don't store images, share them, or use them for training."
  ],
  [
    "Do I need an account to try it?",
    "No. Your first 5 cleans are free and require no account. You only need to sign up when you want to clean more."
  ]
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="section-pad">
          <div className="section-wrap grid gap-10 lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-mint">
                <Shield size={14} /> Privacy-forward image cleaner
              </div>
              <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.15] tracking-tight text-[color:var(--color-text)] md:text-[52px]">
                Your photos carry more than you think.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)]">
                Strip hidden metadata — GPS location, camera info, editor tags — before you post to
                TikTok, Instagram, or anywhere else. First 5 cleans are free. No account needed.
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
                  <p className="mt-2 text-sm text-white/55">or tap to choose — JPG, PNG, WEBP supported</p>
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

        <section className="border-y border-line bg-[color:var(--color-surface-alt)] py-5">
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

        <section id="metadata" className="section-pad">
          <div className="section-wrap">
            <div className="max-w-3xl">
              <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">What&apos;s hiding in your photos?</h2>
              <p className="mt-4 leading-7 text-white/65">
                Every time you take a photo, your device embeds invisible data into the file. This can include your exact GPS location, the device you used, the apps that edited it, timestamps, and more. Most people never know it&apos;s there.
              </p>
              <p className="mt-4 leading-7 text-white/65">
                When you post online, that data travels with the file. FileGhost strips it out before you share — so what you post is just the image, nothing else.
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

        <section id="how-it-works" className="section-pad bg-[color:var(--color-surface-alt)]">
          <div className="section-wrap">
            <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">Upload, clean, download.</h2>
            <div className="relative mt-8 grid gap-4 md:grid-cols-4">
              <div className="absolute left-8 right-8 top-8 hidden h-px bg-line md:block" />
              {[
                ["Upload your images", "JPG, PNG, or WEBP. Drop up to 5 free — no signup yet."],
                ["We scan for hidden metadata", "Our server reads every embedded tag in your file."],
                ["Metadata is stripped server-side", "We remove it during re-encoding. Not just flagged — gone."],
                ["Download your clean files", "Get individual files or a clean ZIP. Original quality preserved."]
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

        <section className="section-pad">
          <div className="section-wrap">
            <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">Built for anyone who posts photos online.</h2>
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

        <section id="pricing" className="section-pad bg-[color:var(--color-surface-alt)]">
          <div className="section-wrap">
            <div className="mb-8">
              <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">Simple pricing. Start free.</h2>
              <p className="mt-3 text-white/60">Upgrade when cleaning becomes part of your regular workflow.</p>
            </div>
            <Suspense fallback={<div className="surface-card p-5 text-sm text-white/60">Loading pricing...</div>}>
              <PricingCards />
            </Suspense>
          </div>
        </section>

        <section className="section-pad">
          <div className="section-wrap">
            <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">Privacy is the product, not the promise.</h2>
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
          </div>
        </section>

        <section className="section-pad bg-[color:var(--color-surface-alt)]">
          <div className="section-wrap max-w-4xl">
            <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">FAQ</h2>
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

        <section className="border-t-4 border-mint bg-[color:var(--color-surface-alt)] px-4 py-14 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[26px] font-bold tracking-tight md:text-[32px]">Clean your images before you post.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/60">
              Remove GPS, device info, and hidden file data in seconds. First 5 cleans are free — no account needed.
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
          Clean Your First Photo Free →
        </Link>
      </div>
      <Footer />
    </>
  );
}
