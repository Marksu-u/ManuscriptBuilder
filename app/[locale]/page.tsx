import type { Metadata } from "next";
import Image from "next/image";
import { Cloud, Download, FileText, Palette } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/components/legal/legal-footer";
import { FramedHeader } from "@/components/shell/framed-header";
import { SOURCE_REPO_URL } from "@/components/legal/ecosystem";
import { serializeJsonLd, SITE_URL } from "@/lib/site";

type Copy = { title: string; body: string };
type Faq = { q: string; a: string };
const icons = [FileText, Palette, Download, Cloud];
const styleIds = ["royal", "arcane", "dossier", "datapad"] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: { absolute: t("metaTitle") }, description: t("metaDescription"), alternates: { canonical: "/" }, openGraph: { url: "/" } };
}

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const theme = await getTranslations("workspace.themes");
  const features = t.raw("features.items") as Copy[];
  const faq = t.raw("faq.items") as Faq[];
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", name: t("faq.jsonLdName"), mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  const appJsonLd = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${SITE_URL}/#app`, name: "Manuscript Builder", url: SITE_URL,
    description: t("jsonLd.description"), applicationCategory: "DesignApplication", applicationSubCategory: t("jsonLd.subCategory"), operatingSystem: "Web browser", browserRequirements: "Requires JavaScript", inLanguage: locale,
    isAccessibleForFree: true, image: `${SITE_URL}/opengraph-image`, offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    featureList: features.map((feature) => feature.title), sameAs: [SOURCE_REPO_URL], publisher: { "@id": `${SITE_URL}/#publisher` }, isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return <div className="flex min-h-screen flex-col bg-background">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([faqJsonLd, appJsonLd]) }} />
    <FramedHeader maxWidth="max-w-6xl">
      <a href="#features" className="hidden text-xs text-zinc-500 hover:text-zinc-300 sm:inline">{t("nav.how")}</a>
      <a href="#faq" className="hidden text-xs text-zinc-500 hover:text-zinc-300 sm:inline">{t("nav.faq")}</a>
      <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-white">{t("nav.manuscripts")}</Link>
    </FramedHeader>
    <main className="flex-1">
      <section className="landing-hero px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-x-16">
        <div className="py-20 sm:py-28"><div className="flex items-center gap-3"><Image src="/icon.svg" width={32} height={32} alt=""/><span className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">{t("hero.eyebrow")}</span></div>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">{t.rich("hero.heading", { accent: (chunks) => <span className="text-accent">{chunks}</span> })}</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">{t("hero.lede")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/workspace" className="flex h-[42px] items-center justify-center rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-900 hover:bg-white">{t("hero.cta")}</Link><Link href="/dashboard" className="flex h-[42px] items-center justify-center rounded-md border border-zinc-700 px-6 text-sm font-medium text-zinc-400 hover:border-zinc-500 hover:text-zinc-200">{t("hero.dashboard")}</Link></div>
          <p className="mt-4 text-xs text-zinc-500">{t("hero.note")}</p>
        </div>
        <div className="landing-paper-stage" aria-label={t("example.aria")}>
          <article className="landing-paper"><p className="landing-paper-kicker">{t("example.kicker")}</p><h2>{t.rich("example.title", { br: () => <br /> })}</h2><div className="landing-paper-rule"/><p>{t("example.p1")}</p><p>{t("example.p2")}</p><p className="landing-signature">{t("example.signature")}</p><span className="landing-seal" aria-hidden="true">BM</span><span className="landing-folio">1</span></article>
          <span className="landing-paper-caption">{t("example.caption")}</span>
        </div>
        </div>
      </section>
      <section id="features" className="border-t border-zinc-900 px-6 py-16"><div className="mx-auto max-w-4xl"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">{t("features.eyebrow")}</p><h2 className="mt-4 text-2xl font-semibold tracking-tight">{t("features.heading")}</h2><div className="mt-8 grid gap-6 sm:grid-cols-2">{features.map(({title,body}, index) => { const Icon = icons[index]; return <div key={title} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5"><Icon size={20} className="mb-4 text-zinc-400"/><h3 className="text-base font-medium">{title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p></div>; })}</div></div></section>
      <section className="border-t border-zinc-900 px-6 py-16"><div className="mx-auto max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight">{t("styles.heading")}</h2><p className="mt-4 text-zinc-400">{t("styles.body")}</p><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{styleIds.map((id) => <Link href="/workspace" key={id} className="group"><div className={`landing-style theme-${id}`}><span>{theme(`${id}.label`)}</span><div/><div/><div/><b>✦</b></div><h3 className="mt-4 text-sm text-zinc-300 group-hover:text-white">{theme(`${id}.name`)}</h3></Link>)}</div></div></section>
      <section id="faq" className="border-t border-zinc-900 px-6 py-16"><div className="mx-auto max-w-3xl"><h2 className="mb-8 text-2xl font-semibold tracking-tight">{t("faq.heading")}</h2>{faq.map(({q,a}) => <details key={q} className="border-b border-zinc-800 py-5"><summary className="cursor-pointer text-sm font-medium text-zinc-200">{q}</summary><p className="mt-3 text-sm leading-relaxed text-zinc-400">{a}</p></details>)}</div></section>
      <section className="border-t border-zinc-900 px-6 py-16 text-center"><h2 className="text-2xl font-semibold tracking-tight">{t("closing.heading")}</h2><Link href="/workspace" className="mt-7 inline-flex h-[42px] items-center justify-center rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-900 hover:bg-white">{t("closing.cta")}</Link></section>
    </main><Footer currentTool="Manuscript Builder"/>
  </div>;
}
