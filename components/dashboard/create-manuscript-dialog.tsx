'use client';

import { useActionState, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createManuscript } from '@/app/actions/manuscripts';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateManuscriptDialog() {
  const t = useTranslations('dashboard');
  const tNew = useTranslations('dashboard.new');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createManuscript, null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<button className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white" />}
      >
        <Plus className="h-4 w-4" />
        {t('create')}
      </DialogTrigger>
      <DialogContent className="bg-background" showCloseButton={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-base font-semibold text-zinc-100">{tNew('heading')}</DialogTitle>
            <DialogDescription className="mt-2 text-sm text-zinc-400">{tNew('description')}</DialogDescription>
          </div>
          <DialogClose
            aria-label={tCommon('close')}
            render={<button className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-300" />}
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>
        <form action={action} className="space-y-4">
          <label className="field">
            <span>{tNew('name')}</span>
            <input name="name" maxLength={80} required autoFocus placeholder={tNew('namePlaceholder')} />
          </label>
          <input type="hidden" name="theme" value="dossier"/>
          {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <div className="flex items-center justify-end gap-3 pt-1">
            <DialogClose render={<button className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200" />}>
              {tNew('cancel')}
            </DialogClose>
            <button disabled={pending} className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:opacity-50">
              {pending ? tNew('creating') : tNew('create')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
