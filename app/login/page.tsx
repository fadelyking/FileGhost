import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to FileGhost."
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint/12 text-mint">
            <ShieldCheck size={20} />
          </span>
          <span className="text-lg font-semibold">FileGhost</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Sign in or create account</h1>
        <p className="mt-2 text-sm text-white/60">
          Sign up or log in to keep cleaning after your free credits.
        </p>
        <Suspense fallback={<div className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm text-white/60">Loading sign in...</div>}>
          <AuthForm />
        </Suspense>
      </section>
    </main>
  );
}
