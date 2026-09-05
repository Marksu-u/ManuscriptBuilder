import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { manuscriptSchema } from '@/lib/manuscript-data';
import ManuscriptWorkspace from '@/components/manuscript-workspace';
import { loadOwnedManuscript } from '@/lib/manuscript-repository';

export async function generateMetadata({params}:{params:Promise<{locale:string}>}): Promise<Metadata> {
  const {locale}=await params;
  const t=await getTranslations({locale,namespace:'workspace'});
  return {title:t('editMetaTitle'),robots:{index:false,follow:true}};
}
export default async function SavedManuscriptPage({params}:{params:Promise<{id:string;locale:string}>}) {
  const user=await getAuthUser();
  const {id,locale}=await params;
  setRequestLocale(locale);
  const record=await loadOwnedManuscript(prisma,user.id,id);
  if(!record) notFound();
  const pages=record.pages.map(page=>page.content);
  const first=pages[0] as {id?:string}|undefined;
  const parsed=manuscriptSchema.safeParse({name:record.title,theme:record.styleId,pages,activeId:first?.id});
  if(!parsed.success) throw new Error('This saved manuscript cannot be opened. Contact support for help recovering it.');
  return <ManuscriptWorkspace key={id} initialManuscript={parsed.data} documentId={id} initialVersion={record.updatedAt.toISOString()}/>;
}
