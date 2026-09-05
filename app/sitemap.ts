import type { MetadataRoute } from 'next';
import { IS_PREVIEW, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // The landing page and public editor are indexable; account data stays private.
  // Use the actual content revision, not a new timestamp on every request.
  return IS_PREVIEW ? [] : ['/', '/workspace'].map(path => ({ url: `${SITE_URL}${path}`, lastModified: new Date('2026-09-05') }));
}
