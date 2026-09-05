'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { blankManuscript, manuscriptSchema, type ThemeId } from '@/lib/manuscript-data';
import { writeOwnedManuscript } from '@/lib/manuscript-repository';

export async function createManuscript(_state: { error: string } | null, form: FormData) {
  const user = await getAuthUser();
  const name = String(form.get('name') ?? '').trim();
  const theme = String(form.get('theme') ?? 'royal') as ThemeId;
  const parsed = manuscriptSchema.safeParse(blankManuscript(name, theme));
  if (!parsed.success) return { error: 'Enter a name (up to 80 characters) and choose a style.' };
  let id: string;
  try {
    const created = await prisma.manuscript.create({data: {
      title: parsed.data.name, styleId: parsed.data.theme, ownerId: user.id,
      pages: {create: parsed.data.pages.map((page, position) => ({position, content: page}))},
    }});
    id = created.id;
  } catch { return { error: 'The manuscript could not be created. Please try again.' }; }
  revalidatePath('/dashboard');
  redirect(`/dashboard/${id}`);
}

export async function importBrowserManuscript(input: unknown): Promise<{error:string}|{id:string}> {
  const user = await getAuthUser();
  const parsed = manuscriptSchema.safeParse(input);
  if (!parsed.success) return { error: 'This browser draft is invalid or too large. Export a JSON backup and check its contents.' };
  try {
    const created = await prisma.manuscript.create({data: {
      title: parsed.data.name, styleId: parsed.data.theme, ownerId: user.id,
      pages: {create: parsed.data.pages.map((page, position) => ({position, content: page}))},
    }});
    revalidatePath('/dashboard');
    return { id: created.id };
  } catch { return { error: 'The draft could not be imported. Your browser copy is still available.' }; }
}

export async function saveManuscript(id: string, expectedVersion: string, input: unknown): Promise<{error:string}|{version:string}> {
  const user = await getAuthUser();
  const parsed = manuscriptSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid manuscript.' };
  const version = new Date(expectedVersion);
  if (!id || Number.isNaN(version.getTime())) return { error: 'Invalid document version. Reload the manuscript.' };
  try {
    const result = await prisma.$transaction(tx => writeOwnedManuscript(tx, user.id, id, version, parsed.data));
    revalidatePath('/dashboard');
    return result;
  } catch { return { error: 'Saving failed. Your edits are still open; retry or download a JSON backup.' }; }
}
