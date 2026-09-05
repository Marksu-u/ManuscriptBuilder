import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/app/actions/auth";
import { GuestImportPrompt } from "@/components/dashboard/guest-import-prompt";
import { FramedHeader } from "@/components/shell/framed-header";
import { getAuthUser } from "@/lib/auth";
import { themes, type ThemeId } from "@/lib/manuscript-data";
import { listOwnedManuscripts } from "@/lib/manuscript-repository";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("metaTitle"), description: t("description"), robots: { index: false, follow: true } };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const theme = await getTranslations("workspace.themes");
  const format = await getFormatter();
  const user = await getAuthUser();
  const manuscripts = await listOwnedManuscripts(prisma, user.id);

  return <div className="min-h-screen bg-background text-zinc-100">
    <FramedHeader maxWidth="max-w-5xl">
      <Link href="/account" className="max-w-32 truncate text-xs text-zinc-500 transition-colors hover:text-zinc-300 sm:max-w-xs">{user.email}</Link>
      <form action={signOut}><button className="whitespace-nowrap text-xs text-zinc-500 hover:text-zinc-300">{t("signOut")}</button></form>
    </FramedHeader>
    <main className="mx-auto max-w-5xl px-6 py-10">
      <GuestImportPrompt />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">{t("heading")}</h1><p className="mt-1 text-sm text-zinc-500">{t("count", { count: manuscripts.length })}</p></div>
        <Link href="/dashboard/new" className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"><Plus size={15}/>{t("create")}</Link>
      </div>
      {manuscripts.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{manuscripts.map((item) => {
        const style = item.styleId in themes ? theme(`${item.styleId as ThemeId}.name`) : t("card.fallbackStyle");
        return <Link key={item.id} href={`/dashboard/${item.id}`} className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-600">
          <div className="mb-5 flex items-center gap-3"><FileText size={30} className="text-accent"/><span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">{style}</span></div>
          <h2 className="truncate text-base font-semibold">{item.title}</h2><p className="mt-1 text-xs text-zinc-500">{t("card.pages", { count: item._count.pages })}</p>
          <p className="mt-3 text-xs text-zinc-500">{t("card.updated", { date: format.dateTime(item.updatedAt, { dateStyle: "medium", timeZone: "UTC" }) })}</p>
        </Link>;
      })}</div> : <section className="rounded-xl border border-dashed border-zinc-700 py-20 text-center"><FileText className="mx-auto mb-4 text-zinc-600" size={36}/><h2 className="text-lg font-medium">{t("empty.title")}</h2><p className="mx-auto mt-2 max-w-sm px-4 text-sm text-zinc-500">{t("empty.description")}</p><Link href="/dashboard/new" className="mt-6 inline-block text-sm text-zinc-200 underline underline-offset-4">{t("empty.action")}</Link></section>}
    </main>
  </div>;
}
