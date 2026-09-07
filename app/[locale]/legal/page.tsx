import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDoc, Section, extLink, mailLink } from "@/components/legal/legal-doc";
import { CONTACT_EMAIL, DATA_HOST, HOST, PUBLISHER_ALIAS } from "@/lib/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPages.notice" });
  return {
    title: { absolute: t("metaTitle") },
    robots: { index: false, follow: true },
  };
}

export default async function LegalNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legalPages.notice");

  return (
    <LegalDoc title={t("title")} updated={t("updated")}>
      {/* Article 6-III-2 of the LCEN, not 6-III-1: a non-professional publisher
          publishes the host's identification instead of their own. No name,
          address, telephone or SIREN below — see lib/legal.ts for what keeps
          that lawful. */}
      <Section title={t("publisher.heading")}>
        <p>{t("publisher.p1")}</p>
        <p>
          {t.rich("publisher.p2", {
            email: CONTACT_EMAIL,
            mail: mailLink(CONTACT_EMAIL),
          })}
        </p>
      </Section>

      <Section title={t("director.heading")}>
        <p>{t("director.p1", { alias: PUBLISHER_ALIAS })}</p>
      </Section>

      <Section title={t("host.heading")}>
        <p>
          {t.rich("host.p1", {
            host: HOST.name,
            address: HOST.address,
            hostEmail: HOST.email,
            hostLink: extLink(HOST.url),
            hostMail: mailLink(HOST.email),
          })}
        </p>
        <p>
          {t.rich("host.p2", {
            dataHost: DATA_HOST.name,
            dataLink: extLink(DATA_HOST.url),
          })}
        </p>
      </Section>

      <Section title={t("ip.heading")}>
        <p>{t("ip.p1")}</p>
        <p>{t("ip.p2")}</p>
        <p>{t("ip.p3")}</p>
      </Section>

      <Section title={t("links.heading")}>
        <p>{t("links.p1")}</p>
      </Section>
    </LegalDoc>
  );
}

