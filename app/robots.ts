import type { MetadataRoute } from 'next';
import { IS_PREVIEW, SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: IS_PREVIEW ? { userAgent: '*', disallow: '/' } : {
      userAgent: '*', allow: '/', disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
