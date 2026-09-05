import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  LegalDoc,
  Section,
  Bullets,
  legalTags,
  extLink,
  intLink,
  mailLink,
} from "@/components/legal/legal-doc";
import { CONTACT_EMAIL, PUBLISHER_ALIAS } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPages.privacy" });
  return {
    title: { absolute: t("metaTitle") },
    robots: { index: false, follow: true },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages.privacy");

  const email = { email: CONTACT_EMAIL, mail: mailLink(CONTACT_EMAIL) };

  return (
    <LegalDoc title={t("title")} updated={t("updated")}>
      <Section title={t("preamble.heading")}>
        <p>{t("preamble.p1")}</p>
      </Section>

      <Section title={t("s1.heading")}>
        <p>{t("s1.p1")}</p>
      </Section>

      <Section title={t("s2.heading")}>
        <p>{t("s2.p1", { alias: PUBLISHER_ALIAS })}</p>
        <p>{t.rich("s2.p2", email)}</p>
      </Section>

      <Section title={t("s3.heading")}>
        <p>{t("s3.p1")}</p>
        <p>{t("s3.p2")}</p>
      </Section>

      <Section title={t("s4.heading")}>
        <p>{t("s4.p1")}</p>
        <Bullets items={t.raw("s4.items")} />
        <p>{t("s4.p2")}</p>
      </Section>

      <Section title={t("s5.heading")}>
        <p>{t("s5.p1")}</p>
        <Bullets
          items={[
            t.rich("s5.item1", legalTags),
            t.rich("s5.item2", legalTags),
            t.rich("s5.item3", legalTags),
            t.rich("s5.item4", { ...legalTags, cookies: intLink("/cookies") }),
          ]}
        />
        <p>{t("s5.p2")}</p>
      </Section>

      <Section title={t("s6.heading")}>
        <p>{t.rich("s6.p1", email)}</p>
      </Section>

      <Section title={t("s7.heading")}>
        <p>{t("s7.p1")}</p>
      </Section>

      <Section title={t("s8.heading")}>
        <p>{t("s8.p1")}</p>
      </Section>

      <Section title={t("s9.heading")}>
        <p>{t("s9.p1")}</p>
      </Section>

      <Section title={t("s10.heading")}>
        <p>{t("s10.p1")}</p>
        <Bullets items={t.raw("s10.items")} />
        <p>{t.rich("s10.p2", email)}</p>
      </Section>

      <Section title={t("s11.heading")}>
        <p>{t.rich("s11.p1", { cnil: extLink(t("s11.cnilUrl")) })}</p>
      </Section>

      <Section title={t("s12.heading")}>
        <p>{t.rich("s12.p1", { terms: intLink("/terms") })}</p>
      </Section>

      <Section title={t("s13.heading")}>
        <p>{t("s13.p1")}</p>
      </Section>

      <Section title={t("s14.heading")}>
        <p>{t("s14.p1")}</p>
      </Section>

      <Section title={t("s15.heading")}>
        <p>{t.rich("s15.p1", email)}</p>
      </Section>
    </LegalDoc>
  );
}

