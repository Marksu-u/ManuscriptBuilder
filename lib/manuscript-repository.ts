import type { Prisma, PrismaClient } from '@prisma/client';
import type { Manuscript } from './manuscript-data';

type Database = Pick<PrismaClient, 'manuscript'>;

export function listOwnedManuscripts(db: Database, ownerId: string) {
  return db.manuscript.findMany({where:{ownerId},orderBy:{updatedAt:'desc'},select:{id:true,title:true,styleId:true,updatedAt:true,_count:{select:{pages:true}}}});
}

export function loadOwnedManuscript(db: Database, ownerId: string, id: string) {
  return db.manuscript.findFirst({where:{id,ownerId},include:{pages:{orderBy:{position:'asc'}}}});
}

export async function writeOwnedManuscript(tx: Prisma.TransactionClient, ownerId: string, id: string, version: Date, manuscript: Manuscript): Promise<{error:string}|{version:string}> {
  // The guarded write takes the row lock before replacing pages. Both writes
  // run in the caller's transaction so failure restores the previous document.
  const updatedAt = new Date(Math.max(Date.now(), version.getTime() + 1));
  const changed = await tx.manuscript.updateMany({
    where: { id, ownerId, updatedAt: version },
    data: { title: manuscript.name, styleId: manuscript.theme, updatedAt },
  });
  if (!changed.count) return { error: 'This manuscript changed elsewhere or is no longer available. Download JSON to keep your edits, then reload.' };
  await tx.manuscriptPage.deleteMany({where:{manuscriptId:id}});
  await tx.manuscriptPage.createMany({data:manuscript.pages.map((page, position) => ({manuscriptId:id, position, content:page}))});
  return { version: updatedAt.toISOString() };
}
