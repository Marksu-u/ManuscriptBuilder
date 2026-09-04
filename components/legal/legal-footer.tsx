import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal";

export function LegalLinks() {
  return (
    <nav aria-label="Legal documents" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
      {LEGAL_LINKS.map(({ href, label }) => (
        <Link key={href} href={href} className="transition-colors hover:text-zinc-300 focus-visible:outline-offset-4">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function LegalFooter() {
  return (
    <footer className="mt-auto shrink-0 border-t border-zinc-800 px-6 py-8">
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-300">Manuscript Builder</span> is part of{" "}
          <span className="font-medium text-zinc-300">Bag Of Holding Tools</span> — free tools for your worlds.
        </p>
        <LegalLinks />
      </div>
    </footer>
  );
}
