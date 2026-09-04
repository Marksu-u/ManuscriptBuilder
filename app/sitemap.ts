import type { MetadataRoute } from 'next';
import { IS_PREVIEW, SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  // Only the public editor is indexable. Do not list account or legal pages.
  // Use the actual content revision, not a new timestamp on every request.
  return IS_PREVIEW ? [] : [{ url: `${SITE_URL}/`, lastModified: new Date('2026-09-05') }];
}
