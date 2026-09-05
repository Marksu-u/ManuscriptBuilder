'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { createManuscript } from '@/app/actions/manuscripts';
import { themes } from '@/lib/manuscript-data';
import { FramedHeader } from '@/components/shell/framed-header';

export default function NewManuscriptPage() {
  const [state,action,pending]=useActionState(createManuscript,null);
  return <div className="min-h-screen bg-background"><FramedHeader href="/dashboard" toolName="← Your manuscripts" maxWidth="max-w-md"/><main className="mx-auto max-w-md px-6 py-16"><h1 className="mb-2 text-2xl font-semibold">New manuscript</h1><p className="mb-8 text-sm text-zinc-400">Choose a name and a starting style. You can change both later.</p><form action={action} className="space-y-5"><label className="field"><span>Name</span><input name="name" maxLength={80} required autoFocus placeholder="The Blackmere summons"/></label><label className="field"><span>Style</span><select name="theme" className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">{Object.entries(themes).map(([id,theme])=><option key={id} value={id}>{theme.name}</option>)}</select></label>{state?.error&&<p role="alert" className="text-sm text-destructive">{state.error}</p>}<div className="flex items-center gap-4"><button disabled={pending} className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50">{pending?'Creating…':'Create manuscript'}</button><Link href="/dashboard" className="text-sm text-zinc-400">Cancel</Link></div></form></main></div>;
}
