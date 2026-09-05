import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { signOut } from '@/app/actions/auth';
import { FramedHeader } from '@/components/shell/framed-header';
import { LegalFooter } from '@/components/legal/legal-footer';
import { GuestImportPrompt } from '@/components/dashboard/guest-import-prompt';
import { themes, type ThemeId } from '@/lib/manuscript-data';
import { pageMetadata } from '@/lib/site';
import { listOwnedManuscripts } from '@/lib/manuscript-repository';

export const metadata = pageMetadata({title:'Your manuscripts · Manuscript Builder',description:'Open and manage your saved manuscripts.',path:'/dashboard',noindex:true});

export default async function DashboardPage() {
  const user = await getAuthUser();
  const manuscripts = await listOwnedManuscripts(prisma, user.id);
  return <div className="flex min-h-screen flex-col bg-background">
    <FramedHeader>
      <Link href="/account" className="max-w-32 truncate text-xs text-zinc-500 hover:text-zinc-300 sm:max-w-xs">{user.email}</Link>
      <form action={signOut}><button className="whitespace-nowrap text-xs text-zinc-500 hover:text-zinc-300">Sign out</button></form>
    </FramedHeader>
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <GuestImportPrompt />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight">Your manuscripts</h1><p className="mt-1 text-sm text-zinc-500">{manuscripts.length ? `${manuscripts.length} saved ${manuscripts.length === 1 ? 'manuscript' : 'manuscripts'}` : 'A place for the stories your players can hold.'}</p></div>
        <Link href="/dashboard/new" className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"><Plus size={15}/> New manuscript</Link>
      </div>
      {manuscripts.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{manuscripts.map(item => <Link key={item.id} href={`/dashboard/${item.id}`} className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-600">
        <div className="mb-5 flex items-center gap-3"><FileText size={30} className="text-accent"/><span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">{themes[item.styleId as ThemeId]?.name ?? 'Manuscript'}</span></div>
        <h2 className="truncate text-base font-semibold">{item.title}</h2><p className="mt-1 text-xs text-zinc-500">{item._count.pages} {item._count.pages === 1 ? 'page' : 'pages'}</p>
        <p className="mt-3 text-xs text-zinc-500">Updated <time dateTime={item.updatedAt.toISOString()}>{new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeZone:'UTC'}).format(item.updatedAt)}</time></p>
      </Link>)}</div> : <section className="rounded-xl border border-dashed border-zinc-700 py-20 text-center"><FileText className="mx-auto mb-4 text-zinc-600" size={36}/><h2 className="text-lg font-medium">Your first manuscript starts here</h2><p className="mx-auto mt-2 max-w-sm px-4 text-sm text-zinc-500">Create a letter, a grimoire or a secret transmission. Your account manuscripts will appear here when you return.</p><Link href="/dashboard/new" className="mt-6 inline-block text-sm text-zinc-200 underline underline-offset-4">Create a manuscript →</Link></section>}
    </main><LegalFooter/>
  </div>;
}
