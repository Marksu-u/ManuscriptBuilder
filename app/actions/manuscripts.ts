'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { blankManuscript, manuscriptSchema, type ThemeId } from '@/lib/manuscript-data';
import { writeOwnedManuscript } from '@/lib/manuscript-repository';

export async function createManuscript(_state: { error: string } | null, form: FormData) {
  const t = await getTranslations('actions.manuscripts');
  const locale = await getLocale() as Locale;
  const user = await getAuthUser();
  const name = String(form.get('name') ?? '').trim();
  const theme = String(form.get('theme') ?? 'royal') as ThemeId;
  const candidate = blankManuscript(name, theme);
  candidate.pages[0].title = t('untitled');
  candidate.pages[0].body = t('begin');
  const parsed = manuscriptSchema.safeParse(candidate);
  if (!parsed.success) return { error: t('invalidCreate') };
  let id: string;
  try {
    const created = await prisma.manuscript.create({data: {
      title: parsed.data.name, styleId: parsed.data.theme, ownerId: user.id,
      pages: {create: parsed.data.pages.map((page, position) => ({position, content: page}))},
    }});
    id = created.id;
  } catch { return { error: t('createFailed') }; }
  revalidatePath(getPathname({href:'/dashboard',locale}));
  redirect(getPathname({href:`/dashboard/${id}`,locale}));
}

export async function importBrowserManuscript(input: unknown): Promise<{error:string}|{id:string}> {
  const t = await getTranslations('actions.manuscripts');
  const locale = await getLocale() as Locale;
  const user = await getAuthUser();
  const parsed = manuscriptSchema.safeParse(input);
  if (!parsed.success) return { error: t('invalidImport') };
  try {
    const created = await prisma.manuscript.create({data: {
      title: parsed.data.name, styleId: parsed.data.theme, ownerId: user.id,
      pages: {create: parsed.data.pages.map((page, position) => ({position, content: page}))},
    }});
    revalidatePath(getPathname({href:'/dashboard',locale}));
    return { id: created.id };
  } catch { return { error: t('importFailed') }; }
}

export async function saveManuscript(id: string, expectedVersion: string, input: unknown): Promise<{error:string}|{version:string}> {
  const t = await getTranslations('actions.manuscripts');
  const locale = await getLocale() as Locale;
  const user = await getAuthUser();
  const parsed = manuscriptSchema.safeParse(input);
  if (!parsed.success) return { error: t('invalid') };
  const version = new Date(expectedVersion);
  if (!id || Number.isNaN(version.getTime())) return { error: t('invalidVersion') };
  try {
    const result = await prisma.$transaction(tx => writeOwnedManuscript(tx, user.id, id, version, parsed.data));
    revalidatePath(getPathname({href:'/dashboard',locale}));
    return result;
  } catch { return { error: t('saveFailed') }; }
}
