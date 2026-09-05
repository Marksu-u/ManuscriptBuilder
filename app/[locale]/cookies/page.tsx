import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDoc, Section, Bullets, legalTags, extLink } from "@/components/legal/legal-doc";
import { CookiePreferences } from "@/components/analytics/cookie-preferences";

// These bilingual documents are shared verbatim across every Bag Of Holding
// Tools site, so they are kept out of the index to avoid duplicate content.
// `absolute` stops the root layout template appending a second suffix.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPages.cookies" });
  return {
    title: { absolute: t("metaTitle") },
    robots: { index: false, follow: true },
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages.cookies");

  return (
    <LegalDoc title={t("title")} updated={t("updated")}>
      <Section title={t("s1.heading")}>
        <p>{t("s1.p1")}</p>
        <p>{t.rich("s1.p2", legalTags)}</p>
      </Section>

      <Section title={t("s2.heading")}>
        <p>{t("s2.p1")}</p>
        <Bullets items={[t.rich("s2.item1", legalTags)]} />
      </Section>

      <Section title={t("s3.heading")}>
        <p>{t.rich("s3.p1", legalTags)}</p>
        <p>{t.rich("s3.p2", legalTags)}</p>
      </Section>

      <Section title={t("s4.heading")}>
        <p>{t.rich("s4.p1", legalTags)}</p>
        <Bullets items={[t.rich("s4.item1", legalTags)]} />
        <p>{t.rich("s4.p2", legalTags)}</p>
        <p>{t("s4.p3")}</p>
        <CookiePreferences />
      </Section>

      <Section title={t("s5.heading")}>
        <p>{t.rich("s5.p1", legalTags)}</p>
        <Bullets items={t.raw("s5.items")} />
      </Section>

      <Section title={t("s6.heading")}>
        <p>{t.rich("s6.p1", { ...legalTags, cnil: extLink(t("s6.cnilUrl")) })}</p>
      </Section>
    </LegalDoc>
  );
}
