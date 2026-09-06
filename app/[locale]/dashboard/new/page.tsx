'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useActionState } from 'react';
import { createManuscript } from '@/app/actions/manuscripts';
import { FramedHeader } from '@/components/shell/framed-header';

export default function NewManuscriptPage() {
  const [state,action,pending]=useActionState(createManuscript,null);
  const t = useTranslations('dashboard.new');
  return <div className="min-h-screen bg-background"><FramedHeader href="/dashboard" toolName={t('back')} maxWidth="max-w-md"/><main className="mx-auto max-w-md px-6 py-16"><h1 className="mb-2 text-2xl font-semibold">{t('heading')}</h1><p className="mb-8 text-sm text-zinc-400">{t('description')}</p><form action={action} className="space-y-5"><label className="field"><span>{t('name')}</span><input name="name" maxLength={80} required autoFocus placeholder={t('namePlaceholder')}/></label><input type="hidden" name="theme" value="dossier"/>{state?.error&&<p role="alert" className="text-sm text-destructive">{state.error}</p>}<div className="flex items-center gap-4"><button disabled={pending} className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50">{pending?t('creating'):t('create')}</button><Link href="/dashboard" className="text-sm text-zinc-400">{t('cancel')}</Link></div></form></main></div>;
}
