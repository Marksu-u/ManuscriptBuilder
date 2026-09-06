'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { blankManuscript, exportManuscript, manuscriptSchema, type Manuscript, type ThemeId } from '@/lib/manuscript-data';
import { blankComposition } from '@/lib/composition';
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
  const editor = await getTranslations('workspace.composer');
  candidate.pages[0].composition = blankComposition(t('untitled'),t('begin'),Object.fromEntries(['background','behind','page','surface','content','above','foreground'].map(id=>[id,editor(`layerNames.${id}`)])));
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

export async function exportEverything() {
  const user = await getAuthUser();
  const records = await prisma.manuscript.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { pages: { orderBy: { position: 'asc' } } },
  });
  return {
    version: 1 as const,
    product: 'manuscript-builder' as const,
    exportedAt: new Date().toISOString(),
    manuscripts: records.map((record) => exportManuscript(manuscriptSchema.parse({
      name: record.title,
      theme: record.styleId,
      activeId: (record.pages[0]?.content as Manuscript['pages'][number] | undefined)?.id,
      pages: record.pages.map((page) => page.content),
    }))),
  };
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
