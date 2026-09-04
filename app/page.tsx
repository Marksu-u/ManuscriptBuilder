'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import {
  AlignCenter, AlignLeft, AlignRight, Check, FilePlus2,
  ImagePlus, Italic, Minus, Plus, Settings, Sparkles, Square, Trash2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkspaceAccountChip } from '@/components/workspace-account-chip';
import { WorkspaceToolbar } from '@/components/workspace-toolbar';
import { LegalLinks } from '@/components/legal/legal-footer';
import { triggerJsonDownload } from '@/lib/export';

type ThemeId = 'royal' | 'arcane' | 'datapad' | 'dossier';
type TextAlign = 'left' | 'center' | 'right';
type InspectorTab = 'details' | 'style' | 'page';
type Page = { id: string; title: string; body: string; align: TextAlign; image?: string };
type Manuscript = { name: string; pages: Page[]; activeId: string; theme: ThemeId };

type WebMcpTool = {
  name: string; title: string; description: string; inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};

declare global {
  interface Document {
    modelContext?: { registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void | Promise<void> };
  }
}

const STORAGE_KEY = 'boh-manuscript-v1';
const themes: Record<ThemeId, { name: string; family: string; label: string }> = {
  royal: { name: 'Royal decree', family: 'Medieval', label: 'BY ORDER OF THE CROWN' },
  arcane: { name: 'Arcane grimoire', family: 'Fantasy', label: 'THE THIRD CONJURATION' },
  datapad: { name: 'Orbital datapad', family: 'Science fiction', label: 'TRANSMISSION // 08.41' },
  dossier: { name: 'Field dossier', family: 'Modern', label: 'EYES ONLY // CASE 47' },
};

const INITIAL: Manuscript = {
  name: 'The Blackmere summons', theme: 'royal', activeId: 'page-1',
  pages: [
    {
      id: 'page-1', title: 'A summons to Blackmere Keep', align: 'left',
      body: 'Let it be known that, on the first night of the waning moon, those named below are called to the old keep at Blackmere.\n\nBring neither herald nor banner. Speak of this journey to no soul, for the roads are watched and the ravens no longer carry messages for the crown.',
    },
    { id: 'page-2', title: 'The sealed instruction', align: 'left', body: 'Break this seal only when the western bell sounds twice.' },
  ],
};

function inlineMarkup(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function validManuscript(value: unknown): value is Manuscript {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Manuscript>;
  return typeof item.name === 'string' && typeof item.activeId === 'string' &&
    typeof item.theme === 'string' && item.theme in themes && Array.isArray(item.pages) && item.pages.length > 0 &&
    item.pages.every((page) => page && typeof page.id === 'string' && typeof page.title === 'string' && typeof page.body === 'string');
}

export default function Home() {
  const [manuscript, setManuscript] = useState<Manuscript>(INITIAL);
  const [saved, setSaved] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [zoom, setZoom] = useState(78);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('details');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [exporting, setExporting] = useState(false);
  const undoStack = useRef<Manuscript[]>([]);
  const redoStack = useRef<Manuscript[]>([]);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const active = useMemo(
    () => manuscript.pages.find((page) => page.id === manuscript.activeId) ?? manuscript.pages[0],
    [manuscript],
  );
  const activeIndex = manuscript.pages.findIndex((page) => page.id === active.id);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (validManuscript(parsed)) setManuscript(parsed);
        }
      } catch { /* An unreadable local draft falls back to the example. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated || saved) return;
    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(manuscript)); } catch { /* Keep editing if storage is full. */ }
      setSaved(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [hydrated, manuscript, saved]);

  function commit(change: (current: Manuscript) => Manuscript) {
    setManuscript((current) => {
      undoStack.current = [...undoStack.current.slice(-49), current];
      redoStack.current = [];
      return change(current);
    });
    setCanUndo(true);
    setCanRedo(false);
    setSaved(false);
  }

  function updateActive(patch: Partial<Page>) {
    commit((current) => ({
      ...current,
      pages: current.pages.map((page) => page.id === current.activeId ? { ...page, ...patch } : page),
    }));
  }

  function undo() {
    const previous = undoStack.current.at(-1);
    if (!previous) return;
    setManuscript((current) => { redoStack.current.push(current); return previous; });
    undoStack.current.pop();
    setCanUndo(undoStack.current.length > 0); setCanRedo(true); setSaved(false);
  }

  function redo() {
    const next = redoStack.current.at(-1);
    if (!next) return;
    setManuscript((current) => { undoStack.current.push(current); return next; });
    redoStack.current.pop();
    setCanRedo(redoStack.current.length > 0); setCanUndo(true); setSaved(false);
  }

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return;
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea') || target?.isContentEditable) return;
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });

  function addPage() {
    const id = crypto.randomUUID();
    commit((current) => ({ ...current, activeId: id, pages: [...current.pages, { id, title: 'Untitled page', body: 'Begin writing here…', align: 'left' }] }));
    setPagesOpen(true); setInspectorOpen(true); setInspectorTab('details');
  }

  function deletePage() {
    if (manuscript.pages.length === 1) return;
    commit((current) => {
      const index = current.pages.findIndex((page) => page.id === current.activeId);
      const pages = current.pages.filter((page) => page.id !== current.activeId);
      return { ...current, pages, activeId: pages[Math.max(0, index - 1)].id };
    });
  }

  function wrapSelection(mark: '*' | '**') {
    const field = bodyRef.current;
    if (!field) return;
    const start = field.selectionStart; const end = field.selectionEnd;
    const selected = active.body.slice(start, end) || (mark === '**' ? 'bold text' : 'italic text');
    const body = `${active.body.slice(0, start)}${mark}${selected}${mark}${active.body.slice(end)}`;
    updateActive({ body });
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + mark.length, start + mark.length + selected.length); });
  }

  function chooseImage(file?: File) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') updateActive({ image: reader.result }); };
    reader.readAsDataURL(file);
  }

  async function exportPng() {
    const page = pageRef.current;
    if (!page || exporting) return;
    setExporting(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const dataUrl = await toPng(page, {
        width: 560,
        height: 792,
        pixelRatio: 2,
        cacheBust: true,
        style: { transform: 'none', margin: '0' },
      });
      const link = document.createElement('a');
      const baseName = `${manuscript.name}-${activeIndex + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      link.download = `${baseName || 'manuscript-page'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
      window.alert('The PNG could not be generated. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  function downloadJson() {
    const baseName = manuscript.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    triggerJsonDownload(manuscript, `${baseName || 'manuscript'}.json`);
  }

  async function importJson(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validManuscript(parsed)) throw new Error('Invalid manuscript file');
      commit(() => parsed);
      setPagesOpen(true);
    } catch (error) {
      console.error('JSON import failed:', error);
      window.alert('This JSON file is not a valid manuscript.');
    }
  }

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: WebMcpTool) => {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined); } catch { /* optional API */ }
    };
    register({
      name: 'set_manuscript_style', title: 'Set manuscript style',
      description: 'Change the visible manuscript to an available presentation style.',
      inputSchema: { type: 'object', properties: { style: { type: 'string', enum: Object.keys(themes) } }, required: ['style'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const style = (input as { style?: string })?.style;
        if (!style || !(style in themes)) throw new Error('Unknown manuscript style');
        commit((current) => ({ ...current, theme: style as ThemeId }));
        return { style, name: themes[style as ThemeId].name };
      },
    });
    register({
      name: 'update_active_page', title: 'Update active manuscript page',
      description: 'Replace the title and/or body of the page currently open in the editor.',
      inputSchema: { type: 'object', properties: { title: { type: 'string', maxLength: 120 }, body: { type: 'string', maxLength: 12000 } }, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      execute(input) {
        const value = input as { title?: unknown; body?: unknown }; const patch: Partial<Page> = {};
        if (typeof value.title === 'string') patch.title = value.title;
        if (typeof value.body === 'string') patch.body = value.body;
        if (!Object.keys(patch).length) throw new Error('Provide a title or body');
        updateActive(patch); return { pageId: active.id, updated: Object.keys(patch) };
      },
    });
    return () => lifecycle.abort();
  // The browser tool registrations are replaced only when the active page changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.id]);

  return (
    <main className="app-shell">
      <section className="canvas-area" aria-label="Manuscript workspace">
        <div className="workspace-header">
          <WorkspaceToolbar
            pagesOpen={pagesOpen}
            onTogglePages={() => setPagesOpen((open) => !open)}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onExportPng={() => { void exportPng(); }}
            onExportJson={downloadJson}
            onImportJson={() => importInputRef.current?.click()}
            onFitView={() => setZoom(78)}
            exporting={exporting}
            extra={(
              <button
                type="button"
                className="workspace-settings flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                title="Settings"
                aria-label="Settings"
                onClick={() => { setInspectorOpen(true); setInspectorTab('style'); }}
              >
                <Settings className="h-3.5 w-3.5" /><span>Settings</span>
              </button>
            )}
          />

          <div className="identity-chip floating-chrome">
            <span className="manuscript-mark" aria-hidden="true"><Sparkles /></span>
            <span className="identity-name" title={manuscript.name}>{manuscript.name}</span>
            <span className="identity-stats">{manuscript.pages.length} · A4</span>
          </div>

          <div className="top-right-actions">
            <WorkspaceAccountChip saved={saved} />
          </div>
        </div>

        {pagesOpen && (
          <aside className="pages-panel floating-panel" aria-label="Manuscript pages">
            <header><div><strong>Pages</strong><span>{manuscript.pages.length} in manuscript</span></div><button onClick={() => setPagesOpen(false)} aria-label="Close pages"><X /></button></header>
            <div className="page-list">
              {manuscript.pages.map((page, index) => (
                <button aria-label={`Open page ${index + 1}: ${page.title}`} key={page.id} className={`page-item ${page.id === active.id ? 'active' : ''}`} onClick={() => setManuscript((current) => ({ ...current, activeId: page.id }))}>
                  <span className={`page-thumbnail theme-${manuscript.theme}`}><i /><b /><b /><b /></span>
                  <span className="page-caption"><strong>{String(index + 1).padStart(2, '0')}</strong><span>{page.title}</span></span>
                </button>
              ))}
            </div>
            <footer><Button className="primary-panel-button" onClick={addPage}><FilePlus2 /> Add page</Button></footer>
          </aside>
        )}

        <div className={`page-stage ${inspectorOpen ? 'inspector-visible' : ''} ${pagesOpen ? 'pages-visible' : ''}`}>
          <article
            ref={pageRef}
            className={`manuscript-page theme-${manuscript.theme}`}
            style={{ transform: `scale(${zoom / 100})`, marginBottom: `${792 * (zoom / 100 - 1)}px` }}
          >
            <div className="paper-noise" />
            <div className="ornament ornament-top"><span>✦</span></div>
            <p className="manuscript-kicker">{themes[manuscript.theme].label}</p>
            <h1>{active.title}</h1>
            <div className="title-rule"><span /></div>
            {active.image && <Image unoptimized width={404} height={210} className="manuscript-image" src={active.image} alt="Uploaded manuscript illustration" />}
            <div className="manuscript-body" style={{ textAlign: active.align }}>
              {active.body.split('\n').map((line, index) => line ? <p key={index}>{inlineMarkup(line)}</p> : <div className="paragraph-gap" key={index} />)}
            </div>
            <div className="seal" aria-label="Seal decoration"><span>BM</span></div>
            <p className="signature">By my hand and seal</p>
            <div className="ornament ornament-bottom"><span>✦</span></div>
            <span className="folio">{activeIndex + 1}</span>
          </article>
        </div>

        <div className="zoom-stack floating-chrome" aria-label="Zoom controls">
          <ToolButton label="Zoom in" onClick={() => setZoom((value) => Math.min(120, value + 8))}><Plus /></ToolButton>
          <ToolButton label="Zoom out" onClick={() => setZoom((value) => Math.max(45, value - 8))}><Minus /></ToolButton>
          <ToolButton label="Reset zoom" onClick={() => setZoom(100)}><Square /></ToolButton>
        </div>

        {!inspectorOpen && <button className="open-inspector floating-chrome" onClick={() => setInspectorOpen(true)}>Edit page</button>}

        {inspectorOpen && (
          <aside className="inspector floating-panel" aria-label="Page inspector">
            <header><div><strong>{active.title || 'Untitled page'}</strong><span>Page {activeIndex + 1}</span></div><button onClick={() => setInspectorOpen(false)} aria-label="Close inspector"><X /></button></header>
            <Tabs value={inspectorTab} onValueChange={(value) => setInspectorTab(value as InspectorTab)} className="inspector-tabs-root">
              <TabsList variant="line" className="inspector-tabs">
                <TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="style">Style</TabsTrigger><TabsTrigger value="page">Page</TabsTrigger>
              </TabsList>
              <form className="inspector-form" onSubmit={(event) => event.preventDefault()}>
                <TabsContent value="details" className="inspector-content">
                  <Field label="Title"><input value={active.title} maxLength={120} onChange={(event) => updateActive({ title: event.target.value })} /></Field>
                  <Field label="Body">
                    <div className="format-row">
                      <button type="button" onClick={() => wrapSelection('**')} title="Bold selected text"><strong>B</strong></button>
                      <button type="button" onClick={() => wrapSelection('*')} title="Italic selected text"><Italic /></button>
                      <span />
                      <button type="button" className={active.align === 'left' ? 'active' : ''} onClick={() => updateActive({ align: 'left' })} title="Align left"><AlignLeft /></button>
                      <button type="button" className={active.align === 'center' ? 'active' : ''} onClick={() => updateActive({ align: 'center' })} title="Align center"><AlignCenter /></button>
                      <button type="button" className={active.align === 'right' ? 'active' : ''} onClick={() => updateActive({ align: 'right' })} title="Align right"><AlignRight /></button>
                    </div>
                    <textarea ref={bodyRef} value={active.body} maxLength={12000} onChange={(event) => updateActive({ body: event.target.value })} rows={10} />
                    <small>{active.body.length} characters</small>
                  </Field>
                  <Field label="Illustration">
                    {active.image ? (
                      <div className="image-control"><Image unoptimized width={258} height={110} src={active.image} alt="Current manuscript illustration" /><button type="button" onClick={() => updateActive({ image: undefined })}><Trash2 /> Remove</button></div>
                    ) : (
                      <button type="button" className="upload-button" onClick={() => imageInputRef.current?.click()}><ImagePlus /> Add an image</button>
                    )}
                  </Field>
                </TabsContent>
                <TabsContent value="style" className="inspector-content">
                  <Field label="Manuscript style">
                    <Select value={manuscript.theme} onValueChange={(value) => commit((current) => ({ ...current, theme: value as ThemeId }))}>
                      <SelectTrigger className="theme-select"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(themes).map(([id, item]) => <SelectItem key={id} value={id}>{item.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <div className="theme-cards">
                    {(Object.entries(themes) as [ThemeId, (typeof themes)[ThemeId]][]).map(([id, item]) => (
                      <button type="button" aria-label={`Use ${item.name} style`} key={id} className={manuscript.theme === id ? 'selected' : ''} onClick={() => commit((current) => ({ ...current, theme: id }))}>
                        <span className={`theme-swatch theme-${id}`} /><span><strong>{item.name}</strong><small>{item.family}</small></span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-zinc-800 pt-4">
                    <p className="mb-3 text-xs font-medium text-zinc-400">About Manuscript Builder</p>
                    <LegalLinks />
                  </div>
                </TabsContent>
                <TabsContent value="page" className="inspector-content">
                  <Field label="Manuscript name"><input value={manuscript.name} maxLength={80} onChange={(event) => commit((current) => ({ ...current, name: event.target.value }))} /></Field>
                  <Field label="Format"><div className="property-row"><span>Page size</span><strong>A4 portrait</strong></div><div className="property-row"><span>Numbering</span><strong>Visible</strong></div></Field>
                </TabsContent>
                <footer><button type="button" className="saved-button" disabled><Check /> {saved ? 'Saved' : 'Saving…'}</button><button type="button" className="trash-button" disabled={manuscript.pages.length === 1} onClick={deletePage} aria-label="Delete page"><Trash2 /></button></footer>
              </form>
            </Tabs>
          </aside>
        )}

        <input ref={imageInputRef} hidden type="file" accept="image/*" onChange={(event) => { chooseImage(event.target.files?.[0]); event.target.value = ''; }} />
        <input ref={importInputRef} hidden type="file" accept="application/json,.json" onChange={(event) => { void importJson(event.target.files?.[0]); event.target.value = ''; }} />
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function ToolButton({ label, onClick, active, disabled, children }: { label: string; onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" className={`tool-button ${active ? 'active' : ''}`} onClick={onClick} disabled={disabled} title={label} aria-label={label}>{children}</button>;
}
