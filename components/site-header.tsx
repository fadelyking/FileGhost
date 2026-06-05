import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { AuthNavLink, MarketingNavLinks } from "@/components/auth-nav-link";

const nav = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded-md">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint/12 text-mint">
            <ShieldCheck size={20} />
          </span>
          <span className="text-lg font-semibold tracking-tight">FileGhost</span>
        </Link>
        <MarketingNavLinks items={nav} variant="desktop" />
        <div className="flex items-center gap-2">
          <AuthNavLink />
          <details className="relative md:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-line bg-panel text-white">
              <Menu size={18} />
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-line bg-panel p-2 shadow-glow">
              <MarketingNavLinks items={nav} variant="mobile" />
              <Link href="/app" className="block rounded-md px-3 py-2 text-sm font-semibold text-mint hover:bg-white/10">
                Clean Photos
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
