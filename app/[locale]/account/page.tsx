import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { signOut } from "@/app/actions/auth";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { ECOSYSTEM_TOOLS } from "@/components/legal/ecosystem";
import { FramedHeader } from "@/components/shell/framed-header";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("metaTitle"), description: t("description"), robots: { index: false, follow: true } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const user = await getAuthUser();
  const manuscriptCount = await prisma.manuscript.count({ where: { ownerId: user.id } });

  return <div className="min-h-screen bg-background text-zinc-100">
    <FramedHeader toolName={t("back")} href="/dashboard" maxWidth="max-w-xl">
      <form action={signOut}><button type="submit" className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-zinc-300">{t("signOut")}</button></form>
    </FramedHeader>
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-medium tracking-tight">{t("heading")}</h1>
      <section className="mt-6 divide-y divide-zinc-800 rounded-xl border border-zinc-700 bg-surface-1 px-4">
        <div className="flex items-center justify-between gap-4 py-3.5 text-sm"><span className="text-zinc-400">{t("email")}</span><span className="truncate text-zinc-100">{user.email}</span></div>
        <div className="flex items-center justify-between gap-4 py-3.5 text-sm"><span className="text-zinc-400">{t("saved")}</span><span className="font-mono tabular-nums text-zinc-100">{manuscriptCount}</span></div>
      </section>
      <section className="mt-6 rounded-xl border border-zinc-800 border-l-2 border-l-destructive bg-surface-2 p-5">
        <h2 className="text-sm font-semibold text-destructive">{t("danger.heading")}</h2>
        <p className="mt-2 text-sm text-zinc-400">{t("danger.body")}</p>
        <p className="mt-3 text-sm text-zinc-400">{t("danger.ecosystem")}</p>
        <ul className="mt-2 space-y-1">{ECOSYSTEM_TOOLS.map((tool) => <li key={tool.name} className="flex items-center gap-2 text-sm text-zinc-300"><Trash2 className="h-3.5 w-3.5 shrink-0 text-destructive" />{tool.name}</li>)}</ul>
        <div className="mt-4"><DeleteAccountDialog email={user.email} /></div>
      </section>
    </main>
  </div>;
}
