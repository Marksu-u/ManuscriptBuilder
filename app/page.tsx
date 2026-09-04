import ManuscriptWorkspace from '@/components/manuscript-workspace';
import { appJsonLd, pageMetadata, serializeJsonLd, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site';

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' });

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(appJsonLd) }} />
      <ManuscriptWorkspace />
    </>
  );
}
