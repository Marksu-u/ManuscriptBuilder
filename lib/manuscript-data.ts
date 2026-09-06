import { z } from 'zod';
import { compositionSchema, blankComposition, type Composition } from './composition.ts';

export type ThemeId = 'royal' | 'arcane' | 'datapad' | 'dossier';
export type TextAlign = 'left' | 'center' | 'right';
export const decorationAssets = ['wax-seal', 'royal-floral', 'arcane-sigil', 'blood-stain', 'glass-crack', 'evidence-tape', 'royal-fold', 'arcane-scorch', 'datapad-damage', 'dossier-coffee', 'royal-divider', 'arcane-divider', 'datapad-divider', 'dossier-divider', 'uploaded'] as const;
export type DecorationAsset = typeof decorationAssets[number];
export type Decoration = { id: string; asset: DecorationAsset; x: number; y: number; size: number; rotation: number; opacity: number; locked: boolean; layer: 'behind' | 'front'; height?: number; image?: string };
export const textSlots = ['kicker', 'title', 'body', 'signature', 'folio'] as const;
export type TextSlot = typeof textSlots[number];
export type TextLayout = { x: number; y: number; width: number; fontSize: number; rotation: number; color: string; font: 'theme' | 'serif' | 'sans' | 'mono'; align: TextAlign; hidden: boolean; locked: boolean };
export type Page = { composition?: Composition; id: string; title: string; body: string; align: TextAlign; image?: string; decorations?: Decoration[]; textureOpacity?: number; wear?: number; ornamentation?: boolean; paperVariant?: 'clean' | 'worn'; artworkVersion?: 3; textLayout?: Partial<Record<TextSlot, TextLayout>>; kicker?: string; signature?: string; folio?: string };
export type Manuscript = { name: string; pages: Page[]; activeId: string; theme: ThemeId };
export type ManuscriptExport = { version: 4; exportedAt: string; manuscript: Manuscript };

export const STORAGE_KEY = 'boh-manuscript-v1';
export const MAX_MANUSCRIPT_JSON_BYTES = 3_000_000;
export const themes: Record<ThemeId, { name: string; family: string; label: string }> = {
  royal: { name: 'Royal decree', family: 'Medieval', label: 'BY ORDER OF THE CROWN' },
  arcane: { name: 'Arcane grimoire', family: 'Fantasy', label: 'THE THIRD CONJURATION' },
  datapad: { name: 'Orbital datapad', family: 'Science fiction', label: 'TRANSMISSION // 08.41' },
  dossier: { name: 'Field dossier', family: 'Modern', label: 'EYES ONLY // CASE 47' },
};

export const INITIAL: Manuscript = {
  name: 'The Blackmere summons', theme: 'royal', activeId: 'page-1',
  pages: [
    {
      id: 'page-1', title: 'A summons to Blackmere Keep', align: 'left',
      body: 'Let it be known that, on the first night of the waning moon, those named below are called to the old keep at Blackmere.\n\nBring neither herald nor banner. Speak of this journey to no soul, for the roads are watched and the ravens no longer carry messages for the crown.',
    },
    { id: 'page-2', title: 'The sealed instruction', align: 'left', body: 'Break this seal only when the western bell sounds twice.' },
  ],
};


export const manuscriptSchema = z.object({
  name: z.string().trim().min(1).max(80),
  theme: z.enum(['royal', 'arcane', 'datapad', 'dossier']),
  activeId: z.string().min(1).max(100),
  pages: z.array(z.object({
    id: z.string().min(1).max(100), title: z.string().max(120), body: z.string().max(12000),
    align: z.enum(['left', 'center', 'right']),
    composition: compositionSchema.optional(),
    paperVariant: z.enum(['clean', 'worn']).optional(),
    artworkVersion: z.literal(3).optional(),
    kicker: z.string().max(200).optional(), signature: z.string().max(200).optional(), folio: z.string().max(40).optional(),
    textLayout: z.object(Object.fromEntries(textSlots.map(slot => [slot, z.object({
      x: z.number().min(0).max(560), y: z.number().min(0).max(792), width: z.number().min(24).max(560),
      fontSize: z.number().min(8).max(96), rotation: z.number().min(-180).max(180),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/), font: z.enum(['theme', 'serif', 'sans', 'mono']),
      align: z.enum(['left', 'center', 'right']), hidden: z.boolean(), locked: z.boolean(),
    }).optional()]))).optional(),
    textureOpacity: z.number().min(0).max(1).optional(),
    wear: z.number().min(0).max(1).optional(),
    ornamentation: z.boolean().optional(),
    decorations: z.array(z.object({
      id: z.string().min(1).max(100), asset: z.enum(decorationAssets),
      x: z.number().min(0).max(560), y: z.number().min(0).max(792),
      size: z.number().min(24).max(560), rotation: z.number().min(-180).max(180),
      height: z.number().min(12).max(792).optional(),
      image: z.string().max(1_000_000).regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/).optional(),
      opacity: z.number().min(0).max(1), locked: z.boolean(), layer: z.enum(['behind', 'front']),
    }).refine(item => item.asset !== 'uploaded' || Boolean(item.image))).max(40).refine(items => new Set(items.map(item => item.id)).size === items.length).optional(),
    image: z.string().max(1_000_000).regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/).optional(),
  })).min(1).max(50),
}).superRefine((value, ctx) => {
  if (new Set(value.pages.map(page => page.id)).size !== value.pages.length || !value.pages.some(page => page.id === value.activeId)) {
    ctx.addIssue({ code: 'custom', message: 'Pages must have unique IDs and a valid active page.' });
  }
  if (JSON.stringify(value).length > MAX_MANUSCRIPT_JSON_BYTES) ctx.addIssue({ code: 'custom', message: 'This manuscript is too large. Use smaller illustrations.' });
});

export function validManuscript(value: unknown): value is Manuscript {
  return manuscriptSchema.safeParse(value).success;
}

const manuscriptExportSchema = z.object({
  version: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  exportedAt: z.string().datetime(),
  manuscript: manuscriptSchema,
});

export function exportManuscript(manuscript: Manuscript): ManuscriptExport {
  return { version: 4, exportedAt: new Date().toISOString(), manuscript };
}

export function parseManuscriptExport(value: unknown): Manuscript | null {
  const current = manuscriptExportSchema.safeParse(value);
  if (current.success) return current.data.manuscript;
  const legacy = manuscriptSchema.safeParse(value);
  return legacy.success ? legacy.data : null;
}

export function blankManuscript(name: string, theme: ThemeId): Manuscript {
  return { name, theme, activeId: 'page-1', pages: [{ id: 'page-1', title: 'Untitled page', body: 'Begin writing here…', align: 'left', composition: blankComposition('Untitled page','Begin writing here…') }] };
}


export function getPageDecorations(page: Page, theme: ThemeId): Decoration[] {
  if (page.artworkVersion === 3) return page.decorations ?? [];
  const existing: Decoration[] = [...(page.decorations ?? [])];
  if (page.image) existing.push({ id: 'legacy-illustration', asset: 'uploaded', image: page.image, x: 280, y: 350, size: 404, height: 180, rotation: 0, opacity: 1, locked: false, layer: 'front' });
  if (page.ornamentation === false) return existing;
  const defaults: Decoration[] = [45, 242, 750].map((y, index) => ({
    id: `theme-rule-${index}`, asset: `${theme}-divider` as DecorationAsset,
    x: 280, y, size: index === 1 ? 130 : 440, height: index === 1 ? 20 : 32,
    rotation: 0, opacity: 1, locked: false, layer: 'behind',
  }));
  return [...defaults.filter(item => !existing.some(other => other.id === item.id)), ...existing].slice(-40);
}

export function getTextLayout(page: Page, slot: TextSlot, theme: ThemeId): TextLayout {
  const ink = theme === 'arcane' ? '#d8eadc' : theme === 'datapad' ? '#c8f5ff' : theme === 'dossier' ? '#242628' : '#352719';
  const defaults: Record<TextSlot, Partial<TextLayout>> = {
    kicker: { y: 92, fontSize: 10, align: 'center' },
    title: { y: 134, fontSize: 31, align: 'center' },
    body: { y: page.image ? 450 : 264, fontSize: 15, align: page.align },
    signature: { x: 82, y: 650, width: 270, fontSize: 12, hidden: page.ornamentation === false },
    folio: { x: 265, y: 758, width: 30, fontSize: 10, align: 'center' },
  };
  return { x: 78, y: 92, width: 404, fontSize: 15, rotation: 0, color: ink, font: 'theme', align: 'left', hidden: false, locked: false, ...defaults[slot], ...page.textLayout?.[slot] };
}
