import { getTranslations } from "next-intl/server";

export default async function DashboardLoading(){const t=await getTranslations("dashboard");return <main aria-label={t("loading")} className="mx-auto max-w-5xl px-6 py-24"><p role="status" className="text-sm text-zinc-400">{t("loading")}</p></main>;}
