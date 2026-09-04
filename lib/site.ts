import type { Metadata } from 'next';

export const SITE_NAME = 'Manuscript Builder';
export const SITE_TITLE = 'Manuscript Builder — Free TTRPG Handout Creator';
export const SITE_DESCRIPTION = 'Create TTRPG handouts, letters, grimoires and sci-fi datapads. Style illustrated manuscripts in your browser and export PNG or JSON. Free, no account required.';
export const OG_ALT = 'Manuscript Builder — parchment letters and sci-fi handouts for your tabletop worlds';
export const SOURCE_REPO_URL = 'https://github.com/Marksu-u/ManuscriptBuilder';

// OAuth's NEXT_PUBLIC_SITE_URL may point at localhost. Keep canonical URLs on
// the product's public origin, not the dev server or an untrusted request host.
export const PRODUCTION_SITE_URL = 'https://manuscript.bagofholdingtools.com';
const configuredUrl = process.env.SEO_SITE_URL || PRODUCTION_SITE_URL;
const origin = new URL(configuredUrl);
if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('The site URL must use HTTP or HTTPS');
export const SITE_URL = origin.origin;
export const IS_PREVIEW = process.env.VERCEL_ENV === 'preview';

export function pageMetadata({ title, description, path, noindex = false }: {
  title: string; description: string; path: string; noindex?: boolean;
}): Metadata {
  return {
    title: { absolute: title }, description,
    alternates: { canonical: path },
    ...((noindex || IS_PREVIEW) ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title, description, url: path, siteName: SITE_NAME, type: 'website', locale: 'en_US',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: OG_ALT }],
    },
    twitter: {
      card: 'summary_large_image', title, description, creator: '@marksu_u',
      images: [{ url: '/opengraph-image', alt: OG_ALT }],
    },
  };
}

export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL,
      name: SITE_NAME, description: SITE_DESCRIPTION, inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}/#publisher` },
    },
    {
      '@type': 'Organization', '@id': `${SITE_URL}/#publisher`,
      name: 'Bag Of Holding Tools', url: SITE_URL,
      sameAs: ['https://x.com/marksu_u', SOURCE_REPO_URL],
    },
  ],
};

export const appJsonLd = {
  '@context': 'https://schema.org', '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#app`, name: SITE_NAME, url: SITE_URL,
  description: SITE_DESCRIPTION, applicationCategory: 'DesignApplication',
  applicationSubCategory: 'Tabletop roleplaying handout editor',
  operatingSystem: 'Web browser', browserRequirements: 'Requires JavaScript',
  inLanguage: 'en', isAccessibleForFree: true,
  image: `${SITE_URL}/opengraph-image`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  featureList: ['Multi-page manuscripts', 'Four document styles', 'Text formatting and illustrations', 'PNG export', 'Editable JSON backups', 'Local browser saving'],
  sameAs: [SOURCE_REPO_URL],
  publisher: { '@id': `${SITE_URL}/#publisher` },
  isPartOf: { '@id': `${SITE_URL}/#website` },
};

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
