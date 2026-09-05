import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/legal/legal-footer";
import { LanguageSwitcher } from "./language-switcher";
import { FramedHeader } from "@/components/shell/framed-header";

export async function LegalDoc({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const t = await getTranslations("legalPages");
  return (
    <main className="min-h-screen bg-background">
      <FramedHeader maxWidth="max-w-2xl" />
      <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-zinc-300">
        <div className="mb-6 flex items-center justify-between gap-4"><LanguageSwitcher /></div>
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">{title}</h1>
        <p className="mb-8 text-zinc-500">{t("updated", { date: updated })}</p>
        <section className="space-y-6">{children}</section>
        <div className="mt-12">
          <Link href="/" className="text-xs text-zinc-500 underline hover:text-zinc-300">{t("back")}</Link>
        </div>
      </div>
      <Footer currentTool="Manuscript Builder" />
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 font-semibold text-zinc-100">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-400">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

export const legalTags = {
  b: (chunks: ReactNode) => <strong className="text-zinc-300">{chunks}</strong>,
  code: (chunks: ReactNode) => <code className="text-zinc-300">{chunks}</code>,
  stream: (chunks: ReactNode) => <>&lt;{chunks}&gt;</>,
};

export function extLink(href: string) {
  // eslint-disable-next-line react/display-name -- next-intl rich-text renderer
  return (chunks: ReactNode) => <a href={href} className="underline hover:text-zinc-100" target="_blank" rel="noopener noreferrer">{chunks}</a>;
}

export function intLink(href: string) {
  // eslint-disable-next-line react/display-name -- next-intl rich-text renderer
  return (chunks: ReactNode) => <Link href={href} className="underline hover:text-zinc-100">{chunks}</Link>;
}

export function mailLink(address: string) {
  // eslint-disable-next-line react/display-name -- next-intl rich-text renderer
  return (chunks: ReactNode) => <a href={`mailto:${address}`} className="underline hover:text-zinc-100">{chunks}</a>;
}
