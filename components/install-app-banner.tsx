"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { IosInstallModal } from "@/components/ios-install-modal";

type Platform = "android" | "ios" | "other";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissalKey = "install-banner-dismissed";
const fourteenDays = 14 * 24 * 60 * 60 * 1000;

export function InstallAppBanner() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    if (detectedPlatform === "android") {
      const handler = (event: Event) => {
        event.preventDefault();
        setDeferredPrompt(event as BeforeInstallPromptEvent);
        setVisible(true);
      };

      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (detectedPlatform === "ios") {
      setVisible(true);
    }
  }, []);

  async function handleInstallClick() {
    if (platform === "android" && deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setVisible(false);
      if (outcome === "dismissed") dismissForTwoWeeks();
      setDeferredPrompt(null);
      return;
    }

    if (platform === "ios") {
      setShowIosInstructions(true);
    }
  }

  function handleDismiss() {
    setVisible(false);
    dismissForTwoWeeks();
  }

  function handleIosModalClose() {
    setShowIosInstructions(false);
    setVisible(false);
    dismissForTwoWeeks();
  }

  if (!visible) return null;

  return (
    <>
      <div className="my-3 flex flex-col gap-3 rounded-[10px] border border-mint bg-[color:var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Smartphone className="shrink-0 text-mint" size={24} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[color:var(--color-text)]">
              Add FileGhost to your home screen
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[color:var(--color-text-muted)] max-[360px]:hidden">
              Clean photos faster, no browser tabs, one tap from your home screen.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void handleInstallClick()}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-mint px-4 text-[13px] font-bold text-ink hover:bg-white"
          >
            <Download size={15} /> Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="grid h-9 w-9 place-items-center rounded-md text-[color:var(--color-text-muted)] hover:bg-white/10 hover:text-white"
            aria-label="Dismiss install banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {showIosInstructions ? <IosInstallModal onClose={handleIosModalClose} /> : null}
    </>
  );
}

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent;
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1) return "ios";
  return "other";
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function wasDismissedRecently() {
  const dismissed = localStorage.getItem(dismissalKey);
  if (!dismissed) return false;

  const dismissedAt = Number.parseInt(dismissed, 10);
  if (!Number.isFinite(dismissedAt)) return false;

  return Date.now() - dismissedAt < fourteenDays;
}

function dismissForTwoWeeks() {
  localStorage.setItem(dismissalKey, Date.now().toString());
}
