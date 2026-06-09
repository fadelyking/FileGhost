import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-4 pt-10 text-sm text-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 pb-8 sm:grid-cols-2 sm:items-start">
        <div>
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-mint/12 text-mint">
              <ShieldCheck size={20} />
            </span>
            <span className="text-lg font-semibold">FileGhost</span>
          </Link>
          <p className="mt-3 max-w-sm leading-6">FileGhost cleans image metadata for creators who care about privacy.</p>
        </div>
        <div className="flex gap-5 sm:justify-end">
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms of Service
          </Link>
          <Link href="mailto:support@FileGhost.com" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-line py-3 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2025 FileGhost. All rights reserved.</p>
        <p>FileGhost removes file metadata. It does not guarantee how platforms classify content.</p>
      </div>
    </footer>
  );
}
