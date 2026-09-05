import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ECOSYSTEM_TOOLS, SOURCE_REPO_URL } from "./ecosystem";

export function LegalLinks() {
  const t = useTranslations("footer");
  const links = [
    { href: "/legal", label: t("legal") },
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
    { href: "/cookies", label: t("cookies") },
  ] as const;
  return (
    <nav aria-label="Legal documents" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className="transition-colors hover:text-zinc-300 focus-visible:outline-offset-4">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function LegalFooter() {
  return <Footer currentTool="Manuscript Builder" />;
}

export function Footer({ currentTool }: { currentTool: string }) {
  const t = useTranslations("footer");
  const otherTools = ECOSYSTEM_TOOLS.filter((tool) => tool.name !== currentTool);
  return (
    <footer className="border-t border-zinc-800 px-6 py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-zinc-400"><span className="font-medium text-zinc-300">{currentTool}</span> {t("partOf")}{" "}<span className="font-medium text-zinc-300">Bag Of Holding Tools</span> — {t("tagline")}</p>
          <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/legal" className="hover:text-zinc-300">{t("legal")}</Link>
            <Link href="/privacy" className="hover:text-zinc-300">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-zinc-300">{t("terms")}</Link>
            <Link href="/cookies" className="hover:text-zinc-300">{t("cookies")}</Link>
            <a href="https://x.com/marksu_u" target="_blank" rel="me noopener" className="hover:text-zinc-300">{t("twitter")}</a>
            <a href={SOURCE_REPO_URL} target="_blank" rel="noopener" className="hover:text-zinc-300">{t("source")}</a>
          </nav>
        </div>
        {otherTools.length > 0 && <div><p className="text-zinc-400">{t("moreTools")}</p><nav className="mt-2 flex flex-col gap-1">{otherTools.map((tool) => <a key={tool.name} href={tool.url} className="hover:text-zinc-300">{tool.name}</a>)}</nav></div>}
      </div>
    </footer>
  );
}
