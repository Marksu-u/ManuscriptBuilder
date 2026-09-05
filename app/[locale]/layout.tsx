import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { ConsentProvider } from "@/components/analytics/consent-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SOURCE_REPO_URL } from "@/components/legal/ecosystem";
import { locales, LOCALE_TAGS, routing, type Locale } from "@/i18n/routing";
import { IS_PREVIEW, serializeJsonLd, SITE_URL } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("name"), template: `%s · ${t("name")}` },
    description: t("description"),
    applicationName: t("name"),
    robots: {
      ...(IS_PREVIEW ? { index: false, follow: true } : {}),
      googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: {
      siteName: t("name"), type: "website",
      locale: LOCALE_TAGS[locale as Locale] ?? LOCALE_TAGS.en,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image", creator: "@marksu_u" },
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  };
}

export const viewport: Viewport = { themeColor: "#0B0E1A", colorScheme: "dark" };

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "site" });
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: t("name"), alternateName: `${t("name")} — Bag Of Holding Tools`, description: t("jsonLdDescription"), inLanguage: locale, publisher: { "@id": `${SITE_URL}/#publisher` } },
      { "@type": "Organization", "@id": `${SITE_URL}/#publisher`, name: "Bag Of Holding Tools", url: SITE_URL, description: t("orgDescription"), sameAs: ["https://x.com/marksu_u", SOURCE_REPO_URL] },
    ],
  };
  return <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
    <body className="min-h-full flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd) }} />
      <NextIntlClientProvider>
        <ConsentProvider>{children}<ConsentBanner /><GoogleAnalytics /></ConsentProvider>
      </NextIntlClientProvider>
    </body>
  </html>;
}
