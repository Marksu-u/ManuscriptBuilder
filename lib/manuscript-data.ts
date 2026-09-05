import { z } from 'zod';

export type ThemeId = 'royal' | 'arcane' | 'datapad' | 'dossier';
export type TextAlign = 'left' | 'center' | 'right';
export type Page = { id: string; title: string; body: string; align: TextAlign; image?: string };
export type Manuscript = { name: string; pages: Page[]; activeId: string; theme: ThemeId };

export const STORAGE_KEY = 'boh-manuscript-v1';
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
    image: z.string().max(1_000_000).regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/).optional(),
  })).min(1).max(50),
}).superRefine((value, ctx) => {
  if (new Set(value.pages.map(page => page.id)).size !== value.pages.length || !value.pages.some(page => page.id === value.activeId)) {
    ctx.addIssue({code:'custom', message:'Pages must have unique IDs and a valid active page.'});
  }
  if (JSON.stringify(value).length > 3_000_000) ctx.addIssue({code:'custom',message:'This manuscript is too large. Use smaller illustrations.'});
});

export function validManuscript(value: unknown): value is Manuscript {
  return manuscriptSchema.safeParse(value).success;
}

export function blankManuscript(name: string, theme: ThemeId): Manuscript {
  return {name, theme, activeId:'page-1', pages:[{id:'page-1', title:'Untitled page', body:'Begin writing here…', align:'left'}]};
}
