"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";
import { useConsent } from "./consent-provider";

export function ConsentBanner() {
  const { choice, ready, grant, deny } = useConsent();
  const t = useTranslations("consent");
  if (!GA_MEASUREMENT_ID || !ready || choice !== null) return null;
  return <div role="dialog" aria-modal="false" aria-labelledby="consent-label" aria-describedby="consent-body" className="consent-banner fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
    <p id="consent-label" className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{t("label")}</p>
    <p id="consent-body" className="mt-2 text-sm leading-relaxed text-zinc-400">{t("body")} <Link href="/cookies" className="underline hover:text-zinc-100">{t("policy")}</Link></p>
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={deny} className="cursor-pointer rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800">{t("decline")}</button>
      <button type="button" onClick={grant} className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-medium text-zinc-950 transition-opacity hover:opacity-90">{t("accept")}</button>
    </div>
  </div>;
}
