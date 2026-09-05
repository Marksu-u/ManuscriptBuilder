import { notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { manuscriptSchema } from '@/lib/manuscript-data';
import ManuscriptWorkspace from '@/components/manuscript-workspace';
import { loadOwnedManuscript } from '@/lib/manuscript-repository';

export const metadata = { title: 'Edit manuscript', robots: {index:false,follow:true} };
export default async function SavedManuscriptPage({params}:{params:Promise<{id:string}>}) {
  const user=await getAuthUser();
  const {id}=await params;
  const record=await loadOwnedManuscript(prisma,user.id,id);
  if(!record) notFound();
  const pages=record.pages.map(page=>page.content);
  const first=pages[0] as {id?:string}|undefined;
  const parsed=manuscriptSchema.safeParse({name:record.title,theme:record.styleId,pages,activeId:first?.id});
  if(!parsed.success) throw new Error('This saved manuscript cannot be opened. Contact support for help recovering it.');
  return <ManuscriptWorkspace key={id} initialManuscript={parsed.data} documentId={id} initialVersion={record.updatedAt.toISOString()}/>;
}
