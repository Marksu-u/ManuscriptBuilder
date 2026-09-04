'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlignCenter, AlignLeft, Bold, Download, FilePlus2, ImagePlus, Italic,
  Minus, Plus, Redo2, Sparkles, Trash2, Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ThemeId = 'royal' | 'arcane' | 'datapad' | 'dossier';
type Page = { id: number; title: string; body: string };

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

const themes: Record<ThemeId, { name: string; family: string; label: string }> = {
  royal: { name: 'Royal decree', family: 'Medieval', label: 'BY ORDER OF THE CROWN' },
  arcane: { name: 'Arcane grimoire', family: 'Fantasy', label: 'THE THIRD CONJURATION' },
  datapad: { name: 'Orbital datapad', family: 'Science fiction', label: 'TRANSMISSION // 08.41' },
  dossier: { name: 'Field dossier', family: 'Modern', label: 'EYES ONLY // CASE 47' },
};

const starterPages: Page[] = [
  {
    id: 1,
    title: 'A summons to Blackmere Keep',
    body: 'Let it be known that, on the first night of the waning moon, those named below are called to the old keep at Blackmere.\n\nBring neither herald nor banner. Speak of this journey to no soul, for the roads are watched and the ravens no longer carry messages for the crown.',
  },
  { id: 2, title: 'The sealed instruction', body: 'Break this seal only when the western bell sounds twice.' },
];

export default function Home() {
  const [pages, setPages] = useState<Page[]>(starterPages);
  const [activeId, setActiveId] = useState(1);
  const [theme, setTheme] = useState<ThemeId>('royal');
  const [zoom, setZoom] = useState(82);
  const [saved, setSaved] = useState(true);
  const active = useMemo(() => pages.find((page) => page.id === activeId) ?? pages[0], [activeId, pages]);

  useEffect(() => {
    if (saved) return;
    const timer = window.setTimeout(() => setSaved(true), 650);
    return () => window.clearTimeout(timer);
  }, [saved, pages, theme]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
      } catch { /* An unsupported implementation should not affect the editor. */ }
    };

    register({
      name: 'set_manuscript_style',
      title: 'Set manuscript style',
      description: 'Change the visible manuscript to one of the available presentation styles.',
      inputSchema: {
        type: 'object', properties: { style: { type: 'string', enum: Object.keys(themes) } },
        required: ['style'], additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const style = (input as { style?: string })?.style;
        if (!style || !(style in themes)) throw new Error('Unknown manuscript style');
        setTheme(style as ThemeId); setSaved(false);
        return { style, name: themes[style as ThemeId].name };
      },
    });

    register({
      name: 'update_active_page',
      title: 'Update active manuscript page',
      description: 'Replace the title and/or body text of the page currently open in the editor.',
      inputSchema: {
        type: 'object',
        properties: { title: { type: 'string', maxLength: 120 }, body: { type: 'string', maxLength: 12000 } },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input) {
        const value = input as { title?: unknown; body?: unknown };
        const patch: Partial<Page> = {};
        if (typeof value.title === 'string') patch.title = value.title;
        if (typeof value.body === 'string') patch.body = value.body;
        if (!Object.keys(patch).length) throw new Error('Provide a title or body');
        setPages((current) => current.map((page) => page.id === activeId ? { ...page, ...patch } : page));
        setSaved(false);
        return { pageId: activeId, updated: Object.keys(patch) };
      },
    });

    return () => lifecycle.abort();
  }, [activeId]);

  function updatePage(patch: Partial<Page>) {
    setPages((current) => current.map((page) => page.id === active.id ? { ...page, ...patch } : page));
    setSaved(false);
  }

  function addPage() {
    const id = Math.max(...pages.map((page) => page.id), 0) + 1;
    setPages((current) => [...current, { id, title: 'Untitled page', body: 'Begin writing here…' }]);
    setActiveId(id);
    setSaved(false);
  }

  function removeActivePage() {
    if (pages.length === 1) return;
    const index = pages.findIndex((page) => page.id === activeId);
    const next = pages.filter((page) => page.id !== activeId);
    setPages(next);
    setActiveId(next[Math.max(0, index - 1)].id);
    setSaved(false);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><Sparkles size={16} /></div>
          <div>
            <p className="brand-name">Manuscript Builder</p>
            <p className="document-name">A summons to Blackmere Keep</p>
          </div>
        </div>
        <div className="save-state" aria-live="polite">
          <span className={saved ? 'save-dot' : 'save-dot saving'} />
          {saved ? 'Saved locally' : 'Saving…'}
        </div>
        <div className="header-actions">
          <Button variant="ghost" size="icon-sm" aria-label="Undo" disabled><Undo2 /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Redo" disabled><Redo2 /></Button>
          <Button className="export-button" onClick={() => window.print()}>
            <Download data-icon="inline-start" /> Export
          </Button>
        </div>
      </header>

      <div className="workspace">
        <aside className="page-rail" aria-label="Manuscript pages">
          <div className="rail-heading">
            <span>Pages</span>
            <Button variant="ghost" size="icon-sm" aria-label="Add page" onClick={addPage}><FilePlus2 /></Button>
          </div>
          <div className="page-list">
            {pages.map((page, index) => (
              <button key={page.id} className={`page-item ${page.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(page.id)}>
                <span className={`page-thumbnail theme-${theme}`}><i /><b /><b /><b /></span>
                <span className="page-caption"><strong>{index + 1}</strong><span>{page.title}</span></span>
              </button>
            ))}
          </div>
          <Button variant="ghost" className="add-page" onClick={addPage}><Plus data-icon="inline-start" /> Add page</Button>
        </aside>

        <section className="canvas-area" aria-label="Manuscript canvas">
          <div className="canvas-tools" aria-label="Text formatting">
            <Button variant="ghost" size="icon-sm" aria-label="Bold"><Bold /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Italic"><Italic /></Button>
            <span className="tool-divider" />
            <Button variant="ghost" size="icon-sm" aria-label="Align left"><AlignLeft /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Align center"><AlignCenter /></Button>
            <span className="tool-divider" />
            <Button variant="ghost" size="sm"><ImagePlus /> Image</Button>
          </div>
          <div className="page-stage">
            <article className={`manuscript-page theme-${theme}`} style={{ transform: `scale(${zoom / 100})` }}>
              <div className="paper-noise" />
              <div className="ornament ornament-top"><span>✦</span></div>
              <p className="manuscript-kicker">{themes[theme].label}</p>
              <h1>{active.title}</h1>
              <div className="title-rule"><span /></div>
              <div className="manuscript-body">
                {active.body.split('\n').map((line, index) => line ? <p key={index}>{line}</p> : <div className="paragraph-gap" key={index} />)}
              </div>
              <div className="seal" aria-label="Seal decoration"><span>BM</span></div>
              <p className="signature">By my hand and seal</p>
              <div className="ornament ornament-bottom"><span>✦</span></div>
              <span className="folio">{pages.findIndex((page) => page.id === active.id) + 1}</span>
            </article>
          </div>
          <div className="zoom-control">
            <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(50, value - 8))}><Minus /></Button>
            <span>{zoom}%</span>
            <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(120, value + 8))}><Plus /></Button>
          </div>
        </section>

        <aside className="inspector" aria-label="Page inspector">
          <Tabs defaultValue="content" className="h-full gap-0">
            <TabsList variant="line" className="inspector-tabs">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="page">Page</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="inspector-content">
              <section className="control-section">
                <label htmlFor="page-title">Title</label>
                <input id="page-title" value={active.title} onChange={(event) => updatePage({ title: event.target.value })} />
              </section>
              <section className="control-section">
                <label htmlFor="page-body">Body</label>
                <textarea id="page-body" value={active.body} onChange={(event) => updatePage({ body: event.target.value })} rows={12} />
                <p>{active.body.length} characters</p>
              </section>
              <section className="control-section">
                <span className="control-label">Add to page</span>
                <div className="block-grid">
                  <button><span className="block-icon">T</span>Text</button>
                  <button><ImagePlus />Image</button>
                  <button><span className="block-icon">—</span>Divider</button>
                  <button><span className="block-icon">◉</span>Seal</button>
                </div>
              </section>
            </TabsContent>
            <TabsContent value="style" className="inspector-content">
              <section className="control-section">
                <span className="control-label">Manuscript style</span>
                <Select value={theme} onValueChange={(value) => { setTheme(value as ThemeId); setSaved(false); }}>
                  <SelectTrigger className="theme-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(themes).map(([id, item]) => <SelectItem key={id} value={id}>{item.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </section>
              <div className="theme-cards">
                {(Object.entries(themes) as [ThemeId, (typeof themes)[ThemeId]][]).map(([id, item]) => (
                  <button key={id} onClick={() => { setTheme(id); setSaved(false); }} className={theme === id ? 'selected' : ''}>
                    <span className={`theme-swatch theme-${id}`} />
                    <span><strong>{item.name}</strong><small>{item.family}</small></span>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="page" className="inspector-content">
              <section className="control-section">
                <span className="control-label">Format</span>
                <div className="format-row"><span>Page size</span><strong>A4 portrait</strong></div>
                <div className="format-row"><span>Margins</span><strong>Comfortable</strong></div>
                <div className="format-row"><span>Numbering</span><strong>Visible</strong></div>
              </section>
              <Button variant="destructive" className="delete-page" onClick={removeActivePage} disabled={pages.length === 1}>
                <Trash2 data-icon="inline-start" /> Delete this page
              </Button>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </main>
  );
}
