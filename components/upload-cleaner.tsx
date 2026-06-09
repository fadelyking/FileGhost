"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Download, FileArchive, Loader2, Lock, UploadCloud, X, Zap } from "lucide-react";
import { MetadataPreview } from "@/components/metadata-preview";
import type { MetadataSummary } from "@/lib/metadata";
import { FREE_IMAGE_LIMIT, GUEST_FREE_IMAGE_LIMIT } from "@/lib/plans";

type CleanedImage = {
  id: string;
  originalName: string;
  cleanedName: string;
  mimeType: string;
  sizeBefore: number;
  sizeAfter: number;
  metadataBefore: MetadataSummary;
  metadataAfter: MetadataSummary;
  downloadUrl: string;
};

type UsageState = {
  freeUsed: number;
  freeLimit: number;
  plan: string;
  remaining: number | null;
  paid: boolean;
};

type Props = {
  initialUsage: UsageState;
  isLoggedIn: boolean;
};

type CheckoutPlan = "monthly" | "lifetime";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileMb = 15;
const maxBatchSize = 20;
const processingMessages = [
  "Reading file metadata...",
  "Scanning for GPS data...",
  "Scanning for camera info...",
  "Scanning for software tags...",
  "Stripping hidden data...",
  "Re-encoding clean file...",
  "Verifying output...",
  "Almost done..."
];

export function UploadCleaner({ initialUsage, isLoggedIn }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [results, setResults] = useState<CleanedImage[]>([]);
  const [usage, setUsage] = useState(initialUsage);

  useEffect(() => {
    if (!isLoggedIn) {
      const used = Number(localStorage.getItem("FileGhost_guest_used") || 0);
      setUsage({
        freeUsed: used,
        freeLimit: GUEST_FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: Math.max(GUEST_FREE_IMAGE_LIMIT - used, 0),
        paid: false
      });
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isProcessing) return;

    let index = 0;
    setProgress(processingMessages[index]);
    const interval = window.setInterval(() => {
      index = (index + 1) % processingMessages.length;
      setProgress(processingMessages[index]);
    }, 1500);

    return () => window.clearInterval(interval);
  }, [isProcessing]);

  const selectedCount = files.length;
  const isGuest = !isLoggedIn;
  const activeFreeLimit = isGuest ? GUEST_FREE_IMAGE_LIMIT : FREE_IMAGE_LIMIT;
  const remaining = usage.remaining ?? activeFreeLimit;
  const isFreePlan = !usage.paid;
  const hasNoFreeCredits = isFreePlan && remaining === 0;
  const canUse = usage.paid || selectedCount <= remaining;
  const buttonLabel = useMemo(() => {
    if (isProcessing) {
      if (selectedCount > 1) return `Processing ${selectedCount} images... ${progress || processingMessages[0]}`;
      return progress || processingMessages[0];
    }
    if (!selectedCount) return "Choose photos to clean";
    return `Clean ${selectedCount} image${selectedCount === 1 ? "" : "s"}`;
  }, [isProcessing, progress, selectedCount]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setError("");
    setResults([]);

    const incoming = Array.from(fileList);
    const valid = incoming.filter((file) => allowedTypes.includes(file.type) && file.size <= maxFileMb * 1024 * 1024);
    const next = [...files, ...valid].slice(0, maxBatchSize);
    setFiles(next);

    if (incoming.length !== valid.length) {
      setError(`Only JPG, PNG, and WEBP images up to ${maxFileMb}MB are supported.`);
    } else if (files.length + valid.length > maxBatchSize) {
      setError(`You can clean up to ${maxBatchSize} images per batch.`);
    }
  }

  async function processFiles() {
    if (!files.length) {
      inputRef.current?.click();
      return;
    }

    if (!canUse) {
      setError(isLoggedIn ? "You have used your 10 free cleans. Upgrade to keep cleaning." : "You have used your 5 free guest cleans. Create a free account to unlock 5 more.");
      return;
    }

    setIsProcessing(true);
    setProgress(processingMessages[0]);
    setError("");
    const form = new FormData();
    files.forEach((file) => form.append("files", file));

    try {
      const response = await fetch("/api/images/clean", {
        method: "POST",
        body: form
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "Could not clean images. Try smaller files or different images.");
        return;
      }

      setResults(payload.results);
      setProgress("");

      if (isLoggedIn) {
        setUsage(payload.usage);
      } else {
        const nextUsed = usage.freeUsed + payload.results.length;
        localStorage.setItem("FileGhost_guest_used", String(nextUsed));
        setUsage({
          freeUsed: nextUsed,
          freeLimit: GUEST_FREE_IMAGE_LIMIT,
          plan: "guest",
          remaining: Math.max(GUEST_FREE_IMAGE_LIMIT - nextUsed, 0),
          paid: false
        });
      }
    } catch {
      setError("Something went wrong while cleaning your images.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function downloadZip() {
    const response = await fetch("/api/images/zip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds: results.map((result) => result.id) })
    });

    if (!response.ok) {
      setError("Could not create ZIP download.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    triggerDownload(url, "FileGhost-cleaned-images.zip");
    URL.revokeObjectURL(url);
  }

  async function startCheckout(plan: CheckoutPlan) {
    setCheckoutError("");

    if (!isLoggedIn) {
      setCheckoutPlan(plan);
      setAuthModalOpen(true);
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const payload = await response.json();

    if (!response.ok || !payload.url) {
      setCheckoutError(payload.error || "Could not start checkout.");
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <div className="space-y-6">
      {isLoggedIn ? (
      <section className="grid gap-3 sm:grid-cols-3">
        <UsageCard label="Images cleaned" value={usage.paid ? "Active" : String(usage.freeUsed)} />
        {usage.paid ? (
          <UsageCard label="Cleaning" value="Unlimited" valueClassName="text-mint" />
        ) : (
          <UsageCard label="Free cleans remaining" value={usage.remaining === 0 ? "None left" : String(usage.remaining)} remaining={usage.remaining} />
        )}
        <UsageCard label="Your plan" value={usage.paid ? planName(usage.plan) : "Free"} valueClassName={usage.paid ? "text-mint" : undefined} />
      </section>
      ) : null}

      {isFreePlan && remaining > 0 ? (
        <div className="flex flex-col gap-3 rounded-[10px] border border-line border-l-4 border-l-mint bg-panel p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <Zap className="shrink-0 text-mint" size={18} />
            <p className="text-sm text-[color:var(--color-text-muted)]">
              You have {usage.remaining} free cleans remaining. <strong className="font-semibold text-[color:var(--color-text)]">Upgrade for unlimited cleaning.</strong>
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-mint px-4 text-sm font-semibold text-mint transition hover:bg-mint hover:text-ink"
          >
            Upgrade â†’
          </Link>
        </div>
      ) : null}

      {hasNoFreeCredits ? (
        <section className="rounded-xl border border-mint bg-panel p-10 text-center">
          <Lock className="mx-auto text-mint" size={32} />
          <h2 className="mt-5 text-[22px] font-bold text-[color:var(--color-text)]">
            {isGuest ? "You've used your 5 free guest cleans." : "You've used your 10 free cleans."}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-7 text-[color:var(--color-text-muted)]">
            {isGuest
              ? "Create a free account to unlock 5 more cleans. No card needed."
              : "Upgrade to keep cleaning — unlimited images, no restrictions, files always deleted after processing."}
          </p>
          <div className="mx-auto mt-6 flex max-w-xl flex-col justify-center gap-3 sm:flex-row">
            {isGuest ? (
              <button type="button" onClick={() => setAuthModalOpen(true)} className="inline-flex min-h-14 flex-1 items-center justify-center rounded-lg bg-mint px-8 py-4 text-base font-bold text-ink hover:bg-white">
                Create Free Account — Get 5 More
              </button>
            ) : (
              <button type="button" onClick={() => void startCheckout("lifetime")} className="inline-flex min-h-14 flex-1 items-center justify-center rounded-lg bg-mint px-8 py-4 text-base font-bold text-ink hover:bg-white">
                Lifetime Access — $19 one-time
              </button>
            )}
            <button type="button" onClick={() => void startCheckout("monthly")} className="inline-flex min-h-14 flex-1 items-center justify-center rounded-lg border border-line px-8 py-3.5 text-[15px] font-semibold text-white hover:border-mint">
              Monthly — $4.99/mo
            </button>
          </div>
          {checkoutError ? <p className="mt-3 text-sm text-coral">{checkoutError}</p> : null}
          <p className="mt-4 text-[11px] text-[color:var(--color-text-muted)]">
            Secure payment via Stripe. No hidden fees. <Link href="/pricing" className="text-mint hover:text-white">View all options ?</Link>
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
            {isGuest ? "Already have an account? Sign in to use your extra free cleans." : "Your cleaned files above are still available to download."}
          </p>
        </section>
      ) : (
      <section
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed px-8 py-14 text-center transition ${
          isDragging ? "border-mint bg-mint/10" : "border-line bg-panel hover:border-mint"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
        <UploadCloud className="mx-auto text-mint" size={46} />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Upload images. Strip hidden data.</h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[color:var(--color-text-muted)]">
          JPG, PNG, WEBP supported â€” processed privately, deleted after cleaning.
        </p>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => (files.length ? processFiles() : inputRef.current?.click())}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mint px-8 py-3.5 text-base font-bold text-ink focus-ring hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-85 disabled:text-[15px] disabled:font-semibold"
          >
            {isProcessing ? <Loader2 className="animate-spin text-ink" size={18} /> : null}
            {buttonLabel}
          </button>
        </div>
        {files.length ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-2 rounded-md border border-line bg-[color:var(--color-surface-alt)] px-3 py-2.5 text-left text-sm text-white/76">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-white/10"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}
      </section>
      )}

      {results.length ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Cleaned images</h2>
              <p className="text-sm text-white/56">Download files individually or all at once.</p>
            </div>
            <button
              type="button"
              onClick={downloadZip}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/5 px-4 font-semibold text-white focus-ring hover:bg-white/10"
            >
              <FileArchive size={18} /> Download ZIP
            </button>
          </div>

          {results.map((image) => (
            <article key={image.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">{image.originalName}</h3>
                  <p className="text-xs text-white/48">
                    {formatSizeChange(image.sizeBefore, image.sizeAfter)}
                  </p>
                </div>
                <a
                  href={image.downloadUrl}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-mint px-4 font-semibold text-ink focus-ring hover:bg-white"
                >
                  <Download size={18} /> Download
                </a>
              </div>
              <div className="mt-4">
                <MetadataPreview
                  metadataBefore={image.metadataBefore}
                  metadataAfter={image.metadataAfter}
                  showEducationalCleanState={!usage.paid || !isLoggedIn || usage.freeUsed <= 2}
                />
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {files.length ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/92 p-3 backdrop-blur md:hidden">
          <button
            type="button"
            disabled={isProcessing}
            onClick={processFiles}
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-mint px-5 font-semibold text-ink disabled:opacity-70"
          >
            {buttonLabel}
          </button>
        </div>
      ) : null}

      <UpgradeAuthModal open={authModalOpen} plan={checkoutPlan} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function UpgradeAuthModal({ open, plan, onClose }: { open: boolean; plan: CheckoutPlan | null; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const checkoutPath = plan ? `/pricing?plan=${plan}` : "/app";
  const isCreditUnlock = !plan;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();

      if (event.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>("button,a,input");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => modalRef.current?.querySelector<HTMLElement>("button,input")?.focus(), 0);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  function getSupabase() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setStatus("error");
      setMessage("Supabase is not configured yet.");
      return null;
    }

    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  async function continueWithGoogle() {
    setStatus("loading");
    setMessage("");
    const supabase = getSupabase();
    if (!supabase) return;

    // Google OAuth must be enabled in Supabase Auth providers and configured in Google Cloud Console.
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(checkoutPath)}`
      }
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = getSupabase();
    if (!supabase) return;

    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(checkoutPath)}`
      }
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message);
      return;
    }

    setStatus("success");
    setMessage("Check your inbox — we sent you a sign-in link.");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="upgrade-auth-title">
      <div ref={modalRef} className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-auth-title" className="text-xl font-bold">
              {isCreditUnlock ? "Unlock 5 more free cleans" : "Unlock unlimited cleaning"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">
              {isCreditUnlock ? "Create a free account and keep cleaning. No card needed." : "Create a free account to upgrade. Takes 10 seconds."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white" aria-label="Close upgrade dialog">
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void continueWithGoogle()}
          disabled={status === "loading"}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-6 py-3 text-[15px] font-medium text-[#0F172A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:opacity-70"
        >
          <GoogleLogo />
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[13px] text-[color:var(--color-text-muted)]">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={(event) => void sendMagicLink(event)} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="min-h-12 w-full rounded-lg border border-white/10 bg-ink px-3 text-white outline-none placeholder:text-white/30"
          />
          <button type="submit" disabled={status === "loading"} className="min-h-12 w-full rounded-lg bg-mint px-5 font-semibold text-ink hover:bg-white disabled:opacity-70">
            {status === "loading" ? "Sending..." : "Send me a sign-in link"}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-[color:var(--color-text-muted)]">
          By continuing you agree to our <Link href="/terms" className="text-mint hover:text-white">Terms of Service</Link>.
        </p>
        {message ? <p className={`mt-3 text-sm ${status === "error" ? "text-coral" : "text-mint"}`}>{message}</p> : null}
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.68-3.86 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.33-1.58-5.04-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.96 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.57-2.57C13.45.99 11.43 0 9 0A9 9 0 0 0 .96 4.97l3 2.33C4.67 5.16 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function UsageCard({ label, value, remaining, href, valueClassName }: { label: string; value: string; remaining?: number | null; href?: string; valueClassName?: string }) {
  const cardTone =
    remaining === 1
      ? { border: "border-[#F59E0B]", text: "text-[#F59E0B]" }
      : remaining === 2 || remaining === 3
        ? { border: "border-[#F59E0B]", text: "text-[#F59E0B]" }
        : remaining === 0
          ? { border: "border-[#EF4444]", text: "text-[#EF4444]" }
          : { border: "border-white/10", text: "text-white" };

  return (
    <div className={`rounded-lg border bg-white/[0.035] p-4 ${remaining == null ? "border-white/10" : cardTone.border}`}>
      <p className="text-[13px] font-normal text-[color:var(--color-text-muted)]">{label}</p>
      <p className={`mt-1 text-[22px] font-bold leading-[1.2] tracking-tight ${valueClassName || (remaining == null ? "text-[color:var(--color-text)]" : cardTone.text)}`}>{value}</p>
      {href ? (
        <Link href={href} className="mt-2 inline-flex text-xs font-semibold text-mint hover:text-white">
          View pricing â†’
        </Link>
      ) : null}
    </div>
  );
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatSizeChange(sizeBefore: number, sizeAfter: number) {
  if (sizeAfter >= sizeBefore) return `${formatBytes(sizeAfter)} (size unchanged)`;
  return `${formatBytes(sizeBefore)} â†’ ${formatBytes(sizeAfter)}`;
}

function planName(plan: string) {
  if (plan === "monthly") return "Monthly";
  if (plan === "three_month_pass") return "3-Month Pass";
  if (plan === "lifetime") return "Lifetime";
  return "Free";
}

