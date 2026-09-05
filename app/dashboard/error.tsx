'use client';
import Link from 'next/link';
export default function DashboardError({reset}:{reset:()=>void}) {
  return <main className="mx-auto max-w-lg px-6 py-24"><h1 className="text-2xl font-semibold">We couldn’t load your manuscripts</h1><p className="mt-4 text-sm text-zinc-400">Your account data has not been changed. Please retry, or contact support@bagofholdingtools.com if the problem continues.</p><button onClick={reset} className="mt-6 rounded-md bg-zinc-100 px-4 py-2 text-sm text-zinc-900">Try again</button><Link href="/" className="ml-4 text-sm text-zinc-400">Back to home</Link></main>;
}
