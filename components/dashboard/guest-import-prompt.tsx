'use client';
import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { importBrowserManuscript } from '@/app/actions/manuscripts';
import { STORAGE_KEY, parseManuscriptExport, type Manuscript } from '@/lib/manuscript-data';

export function GuestImportPrompt() {
  const t=useTranslations('dashboard.guestImport');
  const [draft,setDraft] = useState<Manuscript|null>(null);
  const [error,setError] = useState<string|null>(null);
  const [pending,startTransition] = useTransition();
  const router=useRouter();
  useEffect(() => {const timer=setTimeout(() => {try {const value=JSON.parse(localStorage.getItem(STORAGE_KEY)??'null'); const draft=parseManuscriptExport(value); if(draft) setDraft(draft);} catch {}},0);return()=>clearTimeout(timer);},[]);
  if(!draft) return null;
  return <section className="mb-8 rounded-xl border border-zinc-700 bg-zinc-900 p-5"><h2 className="text-sm font-medium">{t('heading')}</h2><p className="mt-2 text-sm text-zinc-400">{t('body',{name:draft.name})}</p>{error&&<p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}<div className="mt-4 flex gap-4"><button disabled={pending} className="text-sm text-zinc-100 underline underline-offset-4 disabled:opacity-50" onClick={()=>startTransition(async()=>{setError(null);try {const result=await importBrowserManuscript(draft);if('error'in result)setError(result.error);else {window.localStorage.removeItem(STORAGE_KEY);setDraft(null);router.push(`/dashboard/${result.id}`);}} catch {setError(t('failed'));}})}>{pending?t('importing'):t('import')}</button><button disabled={pending} onClick={()=>setDraft(null)} className="text-sm text-zinc-500">{t('dismiss')}</button></div></section>;
}
