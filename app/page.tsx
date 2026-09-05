import Image from 'next/image';
import Link from 'next/link';
import { FileText, Palette, Download, Cloud } from 'lucide-react';
import { FramedHeader } from '@/components/shell/framed-header';
import { LegalFooter } from '@/components/legal/legal-footer';
import { appJsonLd, pageMetadata, serializeJsonLd, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site';

export const metadata = pageMetadata({title:SITE_TITLE,description:SITE_DESCRIPTION,path:'/'});
const features = [
  {icon:FileText,title:'A page worth passing around',body:'Write letters, secret orders and discoveries. Add illustrations and keep every page together in one manuscript.'},
  {icon:Palette,title:'Made for different worlds',body:'Switch from a royal decree to an arcane grimoire, a field dossier or an orbital datapad without rewriting your words.'},
  {icon:Download,title:'Take it to the table',body:'Export a crisp PNG for your players. Keep an editable JSON backup to revisit the story later.'},
  {icon:Cloud,title:'Pick up where you left off',body:'Work without an account in this browser, or save manuscripts to your account and open them from your dashboard.'},
];
const faq=[
  {q:'Is Manuscript Builder free?',a:'Yes. Create, edit and export manuscripts for free. No subscription or payment is required.'},
  {q:'Do I need an account?',a:'No. The guest editor keeps your draft in this browser. Sign in when you want to save manuscripts to your account and open them on other devices.'},
  {q:'Can I keep my existing browser draft?',a:'Yes. Your dashboard offers to import it into your account. The original browser copy stays on your device.'},
  {q:'What can I export?',a:'Export the current page as a high-resolution PNG, or download the whole manuscript as an editable JSON backup.'},
];
export default function LandingPage(){return <div className="flex min-h-screen flex-col bg-background">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(appJsonLd)}}/>
  <FramedHeader maxWidth="max-w-6xl"><a href="#features" className="hidden text-xs text-zinc-500 hover:text-zinc-300 sm:inline">How it works</a><a href="#faq" className="hidden text-xs text-zinc-500 hover:text-zinc-300 sm:inline">FAQ</a><Link href="/dashboard" className="text-xs text-zinc-400 hover:text-white">Your manuscripts</Link></FramedHeader>
  <main className="flex-1">
    <section className="landing-hero mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
      <div><div className="flex items-center gap-3"><Image src="/icon.svg" width={32} height={32} alt=""/><span className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">Bag Of Holding Tools</span></div>
        <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">Give your players <span className="text-accent">something to hold.</span></h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">A summons sealed in wax. A page torn from a grimoire. A transmission that should never have arrived. Make the handouts that bring your world to life.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/workspace" className="rounded-md bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-white">Create a handout →</Link><Link href="/dashboard" className="rounded-md border border-zinc-700 px-6 py-3 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200">Your manuscripts</Link></div>
        <p className="mt-4 text-xs text-zinc-500">Free to create. No account needed. Your words stay yours.</p>
      </div>
      <div className="landing-paper-stage" aria-label="Example royal decree">
        <article className="landing-paper"><p className="landing-paper-kicker">BY ORDER OF THE CROWN</p><h2>A summons to<br/>Blackmere Keep</h2><div className="landing-paper-rule"/><p>Let it be known that, on the first night of the waning moon, you are called to the old keep at Blackmere.</p><p>Bring neither herald nor banner. Speak of this journey to no soul, for the roads are watched.</p><p className="landing-signature">By my hand and seal</p><span className="landing-seal" aria-hidden="true">BM</span><span className="landing-folio">1</span></article>
        <span className="landing-paper-caption">A story before the first dice roll.</span>
      </div>
    </section>
    <section id="features" className="border-t border-zinc-800 px-6 py-20"><div className="mx-auto max-w-5xl"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent">From a few words to a whole world</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Write it. Style it. Put it in their hands.</h2><div className="mt-10 grid gap-6 sm:grid-cols-2">{features.map(({icon:Icon,title,body})=><div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"><Icon size={20} className="mb-4 text-zinc-400"/><h3 className="text-base font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p></div>)}</div></div></section>
    <section className="border-t border-zinc-800 px-6 py-20"><div className="mx-auto max-w-5xl"><h2 className="text-3xl font-semibold tracking-tight">Not every secret arrives on parchment.</h2><p className="mt-4 text-zinc-400">Four starting styles. Whatever world you are building.</p><div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">{[['royal','Royal decree','By order of the crown'],['arcane','Arcane grimoire','The third conjuration'],['dossier','Field dossier','Eyes only // case 47'],['datapad','Orbital datapad','Transmission 08.41']].map(([id,name,label])=><Link href="/workspace" key={id} className="group"><div className={`landing-style theme-${id}`}><span>{label}</span><div/><div/><div/><b>✦</b></div><h3 className="mt-4 text-sm text-zinc-300 group-hover:text-white">{name}</h3></Link>)}</div></div></section>
    <section id="faq" className="border-t border-zinc-800 px-6 py-20"><div className="mx-auto max-w-3xl"><h2 className="mb-8 text-3xl font-semibold tracking-tight">Before you begin</h2>{faq.map(({q,a})=><details key={q} className="border-b border-zinc-800 py-5"><summary className="cursor-pointer text-sm font-medium text-zinc-200">{q}</summary><p className="mt-3 text-sm leading-relaxed text-zinc-400">{a}</p></details>)}</div></section>
    <section className="border-t border-zinc-800 px-6 py-20 text-center"><h2 className="text-3xl font-semibold tracking-tight">The next clue is yours to write.</h2><Link href="/workspace" className="mt-7 inline-block rounded-md bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-white">Start your manuscript →</Link></section>
  </main><LegalFooter/>
</div>;}
