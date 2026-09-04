import Link from "next/link";
import type { ReactNode } from "react";
import { FramedHeader } from "@/components/shell/framed-header";
import { LegalFooter } from "@/components/legal/legal-footer";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal";

export function LegalDoc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <FramedHeader maxWidth="max-w-2xl" />
      <main className="flex-1 px-6 py-12 text-sm leading-relaxed text-zinc-400 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
          <p className="mb-8 text-xs text-zinc-500">Last updated: <time dateTime={LEGAL_UPDATED.dateTime}>{LEGAL_UPDATED.label}</time></p>
          <div className="space-y-7">{children}</div>
          <Link href="/" className="mt-12 inline-block text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300">
            ← Back to Manuscript Builder
          </Link>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-semibold text-zinc-100">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="break-words text-zinc-300 underline underline-offset-2 hover:text-zinc-100">{children}</Link>;
}

export function Contact() {
  return <LegalLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</LegalLink>;
}
