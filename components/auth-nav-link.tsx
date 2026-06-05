"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ChevronDown, LayoutDashboard, LogOut, UserCircle } from "lucide-react";

type AuthState = {
  loaded: boolean;
  email: string | null;
};

export function AuthNavLink() {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [auth, setAuth] = useState<AuthState>({ loaded: false, email: null });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setAuth({ loaded: true, email: null });
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    supabase.auth.getUser().then(({ data }) => {
      setAuth({ loaded: true, email: data.user?.email || null });
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth({ loaded: true, email: session?.user.email || null });
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  if (!auth.loaded) {
    return <span className="h-10 w-24 rounded-lg bg-white/[0.06]" aria-hidden="true" />;
  }

  if (!auth.email) {
    return <div className="hidden items-center gap-2 sm:flex">
      <Link href="/login" className="px-2 text-sm font-semibold text-white/75 hover:text-white">
        Log in
      </Link>
      <Link href="/dashboard" className="rounded-lg border border-mint bg-transparent px-4 py-2 text-sm font-semibold text-mint focus-ring hover:bg-mint hover:text-ink">
        Open App →
      </Link>
    </div>;
  }

  return (
    <details ref={menuRef} className="relative">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-semibold text-white hover:bg-white/10">
        <UserCircle size={18} className="text-mint" />
        <span className="hidden max-w-40 truncate sm:inline">{auth.email}</span>
        <span className="sm:hidden">Account</span>
        <ChevronDown size={15} />
      </summary>
      <div className="absolute right-0 mt-2 w-64 rounded-lg border border-white/10 bg-panel p-2 shadow-glow">
        <div className="border-b border-white/10 px-3 py-2">
          <p className="text-xs text-white/45">Signed in as</p>
          <p className="truncate text-sm font-semibold text-white">{auth.email}</p>
        </div>
        <Link
          href="/dashboard"
          onClick={() => menuRef.current?.removeAttribute("open")}
          className="mt-2 flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-white/76 hover:bg-white/[0.08] hover:text-white"
        >
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link
          href="/account"
          onClick={() => menuRef.current?.removeAttribute("open")}
          className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-white/76 hover:bg-white/[0.08] hover:text-white"
        >
          <UserCircle size={16} /> Account & billing
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-white/76 hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </details>
  );
}
