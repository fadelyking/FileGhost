"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Lock, Mail } from "lucide-react";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [magicMode, setMagicMode] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next") || "/app";
    const plan = searchParams.get("plan");
    return plan ? `${next}?plan=${plan}` : next;
  }, [searchParams]);

  function getSupabase() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setStatus("error");
      setMessage("Supabase is not configured yet. Add your Supabase URL and anon key to .env.local.");
      return null;
    }

    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async function signInWithGoogle() {
    setStatus("loading");
    setMessage("");
    const supabase = getSupabase();
    if (!supabase) return;

    // Google OAuth must be enabled in Supabase Auth providers and configured in Google Cloud Console.
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      }
    });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message);
    }
  }

  async function sendMagicLink() {
    setStatus("loading");
    setMessage("");
    const supabase = getSupabase();
    if (!supabase) return;

    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
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

  async function submit(mode: "login" | "signup") {
    setStatus("loading");
    setMessage("");
    const supabase = getSupabase();
    if (!supabase) return;

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
            }
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setStatus("error");
      setMessage(result.error.message);
      return;
    }

    setStatus("success");

    if (mode === "signup" && !result.data.session) {
      setMessage("Confirmation email sent. Open the link in your inbox to finish creating your account.");
      return;
    }

    setMessage(mode === "signup" ? "Account created. Taking you to the app..." : "Signed in. Taking you to the app...");
    router.push(nextPath);
    router.refresh();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void (magicMode ? sendMagicLink() : submit("login"));
      }}
      className="mt-6 space-y-4"
    >
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        disabled={status === "loading"}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-6 py-3 text-[15px] font-medium text-[#0F172A] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <GoogleLogo />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] text-[color:var(--color-text-muted)]">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <label className="block text-sm font-medium text-white/75" htmlFor="email">
        Email
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink px-3">
        <Mail size={18} className="text-white/40" />
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="creator@example.com"
          className="min-h-12 w-full bg-transparent text-white outline-none placeholder:text-white/30"
        />
      </div>

      {!magicMode ? (
        <>
          <label className="block text-sm font-medium text-white/75" htmlFor="password">
            Password
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink px-3">
            <Lock size={18} className="text-white/40" />
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              className="min-h-12 w-full bg-transparent text-white outline-none placeholder:text-white/30"
            />
          </div>
        </>
      ) : null}

      {magicMode ? (
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 w-full rounded-lg bg-mint px-5 font-semibold text-ink focus-ring hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? "Sending..." : "Send sign-in link"}
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-12 rounded-lg bg-mint px-5 font-semibold text-ink focus-ring hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Working..." : "Log in"}
          </button>
          <button
            type="button"
            disabled={status === "loading"}
            onClick={() => void submit("signup")}
            className="min-h-12 rounded-lg border border-white/12 bg-white/5 px-5 font-semibold text-white focus-ring hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Sign up
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setMagicMode((value) => !value);
          setMessage("");
          setStatus("idle");
        }}
        className="text-[13px] font-medium text-mint hover:underline"
      >
        {magicMode ? "Use email and password instead →" : "Prefer a sign-in link? Send me a magic link instead →"}
      </button>
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-coral" : "text-mint"}`}>{message}</p>
      ) : null}
    </form>
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
