"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileArchive, Loader2, Lock, UploadCloud, X, Zap } from "lucide-react";
import { MetadataPreview } from "@/components/metadata-preview";
import type { MetadataSummary } from "@/lib/metadata";
import { FREE_IMAGE_LIMIT } from "@/lib/plans";

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

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileMb = 15;
const maxBatchSize = 20;

export function UploadCleaner({ initialUsage, isLoggedIn }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<CleanedImage[]>([]);
  const [usage, setUsage] = useState(initialUsage);

  useEffect(() => {
    if (!isLoggedIn) {
      const used = Number(localStorage.getItem("FileGhost_guest_used") || 0);
      setUsage({
        freeUsed: used,
        freeLimit: FREE_IMAGE_LIMIT,
        plan: "guest",
        remaining: Math.max(FREE_IMAGE_LIMIT - used, 0),
        paid: false
      });
    }
  }, [isLoggedIn]);

  const selectedCount = files.length;
  const remaining = usage.remaining ?? FREE_IMAGE_LIMIT;
  const isFreePlan = !usage.paid;
  const hasNoFreeCredits = isFreePlan && isLoggedIn && remaining === 0;
  const canUse = usage.paid || selectedCount <= remaining;
  const buttonLabel = useMemo(() => {
    if (isProcessing) return progress || "Cleaning images...";
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
      setError(isLoggedIn ? "You have used your 5 free cleans. Upgrade to keep cleaning." : "You have used your 5 free guest cleans. Sign up or upgrade to keep cleaning.");
      return;
    }

    setIsProcessing(true);
    setProgress("Uploading...");
    setError("");
    const form = new FormData();
    files.forEach((file) => form.append("files", file));

    try {
      setProgress("Stripping hidden data...");
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
      setProgress("Done");

      if (isLoggedIn) {
        setUsage(payload.usage);
      } else {
        const nextUsed = usage.freeUsed + payload.results.length;
        localStorage.setItem("FileGhost_guest_used", String(nextUsed));
        setUsage({
          freeUsed: nextUsed,
          freeLimit: FREE_IMAGE_LIMIT,
          plan: "guest",
          remaining: Math.max(FREE_IMAGE_LIMIT - nextUsed, 0),
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

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <UsageCard label="Images cleaned" value={usage.paid ? "—" : String(usage.freeUsed)} />
        {usage.paid ? (
          <UsageCard label="Cleaning" value="Unlimited" valueClassName="text-mint" />
        ) : (
          <UsageCard label="Free cleans remaining" value={usage.remaining === 0 ? "None left" : String(usage.remaining)} remaining={usage.remaining} />
        )}
        <UsageCard label="Your plan" value={usage.paid ? `● ${planName(usage.plan)}` : isLoggedIn ? "Free" : "Guest"} valueClassName={usage.paid ? "text-mint" : undefined} />
      </section>

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
            Upgrade →
          </Link>
        </div>
      ) : null}

      {hasNoFreeCredits ? (
        <section className="rounded-xl border border-mint bg-panel p-10 text-center">
          <Lock className="mx-auto text-mint" size={32} />
          <h2 className="mt-5 text-[22px] font-bold text-[color:var(--color-text)]">You&apos;ve used your 5 free cleans.</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-7 text-[color:var(--color-text-muted)]">
            Upgrade to keep cleaning — unlimited images, no restrictions.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/pricing?plan=lifetime" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-mint px-6 font-bold text-ink hover:bg-white">
              Lifetime — $19 one-time
            </Link>
            <Link href="/pricing?plan=monthly" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-line px-6 font-semibold text-white/75 hover:border-mint hover:text-white">
              Monthly — $4.99/mo
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-[color:var(--color-text-muted)]">
            All plans use Stripe for secure payment. No hidden fees. |{" "}
            <Link href="/pricing" className="text-mint hover:text-white">View all pricing →</Link>
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
        className={`flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition ${
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
          JPG, PNG, WEBP supported — processed privately, deleted after cleaning.
        </p>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => (files.length ? processFiles() : inputRef.current?.click())}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mint px-8 py-3.5 text-base font-bold text-ink focus-ring hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : null}
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
                    {formatBytes(image.sizeBefore)} to {formatBytes(image.sizeAfter)}
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
                <MetadataPreview metadataBefore={image.metadataBefore} metadataAfter={image.metadataAfter} />
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
    </div>
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
      <p className="text-sm text-white/50">{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${valueClassName || (remaining == null ? "" : cardTone.text)}`}>{value}</p>
      {href ? (
        <Link href={href} className="mt-2 inline-flex text-xs font-semibold text-mint hover:text-white">
          View pricing →
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

function planName(plan: string) {
  if (plan === "monthly") return "Monthly";
  if (plan === "three_month_pass") return "3-Month Pass";
  if (plan === "lifetime") return "Lifetime";
  return "Free";
}
