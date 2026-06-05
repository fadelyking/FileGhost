"use client";

import { useState } from "react";

export function BillingPortalButton({ disabled, variant = "primary" }: { disabled: boolean; variant?: "primary" | "secondary" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok || !payload.url) {
      setError(payload.error || "Could not open billing portal.");
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void openPortal()}
        className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-6 py-3 font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
          variant === "primary"
            ? "bg-mint text-ink hover:bg-[color:var(--color-accent-hover)]"
            : "border border-line bg-transparent text-[color:var(--color-text-muted)] hover:border-mint hover:text-white"
        }`}
      >
        {loading ? "Opening..." : "Open billing portal"}
      </button>
      {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
    </div>
  );
}

export function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="post">
      <button
        type="submit"
        className="cursor-pointer text-sm text-[color:var(--color-text-muted)] underline-offset-4 hover:text-[color:var(--color-text)] hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}
