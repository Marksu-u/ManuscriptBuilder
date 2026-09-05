'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
export default function DashboardError({reset}:{reset:()=>void}) {
  const t = useTranslations('dashboard.error');
  return <main className="mx-auto max-w-lg px-6 py-24"><h1 className="text-2xl font-semibold">{t('heading')}</h1><p className="mt-4 text-sm text-zinc-400">{t('body')}</p><button onClick={reset} className="mt-6 rounded-md bg-zinc-100 px-4 py-2 text-sm text-zinc-900">{t('retry')}</button><Link href="/" className="ml-4 text-sm text-zinc-400">{t('home')}</Link></main>;
}
