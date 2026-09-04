import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { IS_PREVIEW, OG_ALT, serializeJsonLd, siteJsonLd, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · Bag Of Holding Tools`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    ...(IS_PREVIEW ? { index: false, follow: true } : {}),
    googleBot: { 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    siteName: SITE_NAME, type: 'website', locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: { card: 'summary_large_image', creator: '@marksu_u' },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = { themeColor: '#0B0E1A', colorScheme: 'dark' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
