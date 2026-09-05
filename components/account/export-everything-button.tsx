'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { exportEverything } from '@/app/actions/manuscripts';
import { triggerJsonDownload } from '@/lib/export';

export function ExportEverythingButton() {
  const t = useTranslations('account.export');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    setPending(true);
    setError(false);
    try {
      triggerJsonDownload(await exportEverything(), 'manuscript-builder-account.json');
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="shrink-0 rounded-md border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? t('preparing') : t('download')}
      </button>
      {error && <span role="alert" className="text-xs text-destructive">{t('error')}</span>}
    </div>
  );
}
