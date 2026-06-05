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

  const nextPath = useMemo(() => {
    const next = searchParams.get("next") || "/app";
    const plan = searchParams.get("plan");
    return plan ? `${next}?plan=${plan}` : next;
  }, [searchParams]);

  async function submit(mode: "login" | "signup") {
    setStatus("loading");
    setMessage("");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setStatus("error");
      setMessage("Supabase is not configured yet. Add your Supabase URL and anon key to .env.local.");
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

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
        void submit("login");
      }}
      className="mt-6 space-y-4"
    >
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
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-coral" : "text-mint"}`}>{message}</p>
      ) : null}
    </form>
  );
}
