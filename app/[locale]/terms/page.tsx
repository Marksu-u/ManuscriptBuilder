import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDoc, Section, Bullets, intLink, mailLink } from "@/components/legal/legal-doc";
import { CONTACT_EMAIL, PUBLISHER_ALIAS } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPages.terms" });
  return {
    title: { absolute: t("metaTitle") },
    robots: { index: false, follow: true },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages.terms");

  // The address lives in lib/legal.ts and is interpolated in; a second copy in
  // two JSON files is a copy that drifts.
  const email = { email: CONTACT_EMAIL, mail: mailLink(CONTACT_EMAIL) };

  return (
    <LegalDoc title={t("title")} updated={t("updated")}>
      <Section title={t("s1.heading")}>
        <p>{t("s1.p1", { alias: PUBLISHER_ALIAS })}</p>
      </Section>

      <Section title={t("s2.heading")}>
        <p>{t("s2.p1")}</p>
      </Section>

      <Section title={t("s3.heading")}>
        <p>{t("s3.p1")}</p>
      </Section>

      <Section title={t("s4.heading")}>
        <p>{t("s4.p1")}</p>
      </Section>

      <Section title={t("s5.heading")}>
        <p>{t("s5.p1")}</p>
      </Section>

      <Section title={t("s6.heading")}>
        <p>{t("s6.p1")}</p>
      </Section>

      <Section title={t("s7.heading")}>
        <p>{t("s7.p1")}</p>
      </Section>

      <Section title={t("s8.heading")}>
        <p>{t("s8.p1")}</p>
        <Bullets items={t.raw("s8.items")} />
      </Section>

      <Section title={t("s9.heading")}>
        <p>{t.rich("s9.p1", email)}</p>
      </Section>

      <Section title={t("s10.heading")}>
        <p>{t("s10.p1")}</p>
      </Section>

      <Section title={t("s11.heading")}>
        <p>{t("s11.p1")}</p>
      </Section>

      <Section title={t("s12.heading")}>
        <p>{t("s12.p1")}</p>
      </Section>

      <Section title={t("s13.heading")}>
        <p>{t.rich("s13.p1", { privacy: intLink("/privacy") })}</p>
      </Section>

      <Section title={t("s14.heading")}>
        <p>{t("s14.p1")}</p>
      </Section>

      <Section title={t("s15.heading")}>
        <p>{t("s15.p1")}</p>
      </Section>

      <Section title={t("s16.heading")}>
        <p>{t("s16.p1")}</p>
      </Section>

      <Section title={t("s17.heading")}>
        <p>{t.rich("s17.p1", email)}</p>
      </Section>
    </LegalDoc>
  );
}

