import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import { IS_PREVIEW, SITE_URL } from "@/lib/site";

const routes = ["/", "/workspace"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (IS_PREVIEW) return [];
  const url = (locale: Locale, href: string) => `${SITE_URL}${getPathname({ href, locale })}`.replace(/\/$/, "") || SITE_URL;
  return routes.map((href) => ({
    url: url(defaultLocale, href),
    lastModified: new Date("2026-09-05"),
    alternates: { languages: Object.fromEntries(locales.map((locale) => [locale, url(locale, href)])) },
  }));
}
