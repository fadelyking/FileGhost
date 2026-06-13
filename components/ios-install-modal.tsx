"use client";

import type { ReactNode } from "react";
import { Share, X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function IosInstallModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/85 p-5 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-[340px] rounded-2xl border border-line bg-[color:var(--color-surface)] p-6 shadow-glow"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md text-[color:var(--color-text-muted)] hover:bg-white/10 hover:text-white"
          aria-label="Close install instructions"
        >
          <X size={18} />
        </button>

        <h3 id="ios-install-title" className="mb-5 pr-8 text-lg font-bold text-[color:var(--color-text)]">
          Add FileGhost to your Home Screen
        </h3>

        <p className="mb-4 rounded-lg border border-mint/30 bg-mint/10 p-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
          If you opened FileGhost from WhatsApp, Instagram, Chrome, or another app, first open it in{" "}
          <strong className="text-[color:var(--color-text)]">Safari</strong>. iPhone only shows Add to Home Screen in Safari.
        </p>

        <InstallStep number="1">
          Tap the <strong className="text-[color:var(--color-text)]">Share</strong> button{" "}
          <Share className="inline-block align-[-3px] text-mint" size={18} /> at the bottom of Safari.
        </InstallStep>
        <InstallStep number="2">
          Scroll down and tap <strong className="text-[color:var(--color-text)]">Add to Home Screen</strong>.
        </InstallStep>
        <InstallStep number="3">
          Tap <strong className="text-[color:var(--color-text)]">Add</strong> in the top right.
        </InstallStep>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 min-h-12 w-full rounded-lg bg-mint px-5 py-3 font-bold text-ink hover:bg-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function InstallStep({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3 text-sm leading-6 text-[color:var(--color-text-muted)]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-[13px] font-bold text-ink">
        {number}
      </span>
      <p>{children}</p>
    </div>
  );
}
