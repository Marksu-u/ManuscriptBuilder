'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { saveManuscript } from '@/app/actions/manuscripts';
import { toPng } from 'html-to-image';
import {
  Check, ChevronLeft, FilePlus2, Minus, Plus, Magnet, Layers, Sparkles, Square, Trash2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { WorkspaceAccountChip } from '@/components/workspace-account-chip';
import { WorkspaceToolbar } from '@/components/workspace-toolbar';
import { LegalLinks } from '@/components/legal/legal-footer';
import { CompositionCanvas } from '@/components/composition-canvas';
import { CompositionPanel, type PanelMode } from '@/components/composition-panel';
import { composePage } from '@/lib/composition-migration';
import { assetIds, baseElement, blankComposition, canEdit, type Composition } from '@/lib/composition';
const artPath = (id: string) => `/art/${id}.png`;
import { triggerJsonDownload } from '@/lib/export';

import {
  MAX_MANUSCRIPT_JSON_BYTES,
  STORAGE_KEY,
  exportManuscript,
  parseManuscriptExport,
  getTextLayout,
  manuscriptSchema,
  type Page,
  type Manuscript,
} from '@/lib/manuscript-data';
type InspectorTab = PanelMode;

export default function ManuscriptWorkspace({ initialManuscript, documentId, initialVersion = '' }: {
  initialManuscript?: Manuscript; documentId?: string; initialVersion?: string;
}) {
  const t = useTranslations('workspace');
  const startingManuscript = initialManuscript ?? {
    name: t('initial.name'), theme: 'royal' as const, activeId: 'page-1',
    pages: [
      { id: 'page-1', title: t('initial.page1Title'), body: t('initial.page1Body'), align: 'left' as const, decorations: [{ id: 'sample-seal', asset: 'wax-seal' as const, x: 425, y: 652, size: 118, rotation: -8, opacity: 1, locked: false, layer: 'front' as const }] },
      { id: 'page-2', title: t('initial.page2Title'), body: t('initial.page2Body'), align: 'left' as const },
    ],
  };
  const router = useRouter();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [manuscript, setManuscript] = useState<Manuscript>(startingManuscript);
  const [saved, setSaved] = useState(true);
  const [hydrated, setHydrated] = useState(Boolean(documentId));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<File | null>(null);
  const version = useRef(initialVersion);
  const latestDraft = useRef(manuscript);
  useEffect(() => { latestDraft.current = manuscript; }, [manuscript]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snapping, setSnapping] = useState(true);
  const [zoom, setZoom] = useState(78);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('inspect');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pageOverflow, setPageOverflow] = useState(false);
  const undoStack = useRef<Manuscript[]>([]);
  const redoStack = useRef<Manuscript[]>([]);
  const pageRef = useRef<HTMLElement>(null);
  const uploadTarget = useRef<{ pageId: string; replaceId?: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const pagesPanelRef = useRef<HTMLElement>(null);
  const inspectorPanelRef = useRef<HTMLElement>(null);

  const active = useMemo(
    () => manuscript.pages.find((page) => page.id === manuscript.activeId) ?? manuscript.pages[0],
    [manuscript],
  );
  const activeIndex = manuscript.pages.findIndex((page) => page.id === active.id);

  const textDefaults = { kicker: t(`themes.${manuscript.theme}.label`), signature: t('document.signature'), folio: String(activeIndex + 1) };
  const composition = composePage(active, manuscript.theme, textDefaults, Object.fromEntries([...['background','behind','page','surface','content','above','foreground'].map(id=>[id,t(`composer.layerNames.${id}`)]), ...['kicker','title','body','signature','folio'].map(id=>[id,t(`art.textSlots.${id}`)]), ...assetIds.map(id=>[id,t(`composer.assets.${id}`)])]));
  function changeComposition(value: Composition) {
    const title = value.elements.find(e=>e.id==='text:title')?.text;
    const body = value.elements.find(e=>e.id==='text:body')?.text;
    const patch = { composition: value, ...(title!==undefined?{title:title.slice(0,120)}:{}), ...(body!==undefined?{body:body.slice(0,12000)}:{}) };
    const candidate = {...manuscript,pages:manuscript.pages.map(p=>p.id===active.id?{...p,...patch}:p)};
    if (!manuscriptSchema.safeParse(candidate).success) { setOperationError(t('json.tooLarge')); return; }
    updateActive(patch);
  }
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const update = () => {
      const bounds = page.getBoundingClientRect();
      setPageOverflow(Array.from(page.querySelectorAll('[data-kind="text"]')).some(text => {
        const rect = text.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        return rect.bottom > bounds.bottom + 1 || rect.right > bounds.right + 1 || rect.left < bounds.left - 1 || rect.top < bounds.top - 1;
      }));
    };
    const observer = new ResizeObserver(update);
    observer.observe(page);
    page.querySelectorAll('[data-kind="text"]').forEach(text => observer.observe(text));
    update();
    return () => observer.disconnect();
  }, [active, manuscript.theme, zoom]);

  const isCompactWorkspace = () => window.matchMedia('(max-width: 640px)').matches;

  function togglePages() {
    setPagesOpen((current) => {
      const next = !current;
      if (next && isCompactWorkspace()) setInspectorOpen(false);
      if (next) window.requestAnimationFrame(() => pagesPanelRef.current?.focus());
      return next;
    });
  }

  function openInspector(tab?: InspectorTab) {
    if (isCompactWorkspace()) setPagesOpen(false);
    if (tab) setInspectorTab(tab);
    setInspectorOpen(true);
    window.requestAnimationFrame(() => inspectorPanelRef.current?.focus());
  }

  const fitPage = useCallback(() => {
    const compactPanels = window.innerWidth <= 820;
    const reservedWidth = compactPanels ? 0 : (inspectorOpen ? 300 : 0) + (pagesOpen ? 222 : 0);
    const horizontalSpace = Math.max(252, window.innerWidth - 48 - reservedWidth);
    const topSpace = window.innerWidth <= 1100 ? 124 : 86;
    const verticalSpace = Math.max(356, window.innerHeight - topSpace - 16);
    const next = Math.floor(Math.min(horizontalSpace / 560, verticalSpace / 792) * 100);
    setZoom(Math.max(45, Math.min(120, next)));
  }, [inspectorOpen, pagesOpen]);

  useEffect(() => {
    if (!hydrated) return;
    const frame = window.requestAnimationFrame(fitPage);
    window.addEventListener('resize', fitPage);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', fitPage);
    };
  }, [fitPage, hydrated]);

  useEffect(() => {
    if (documentId) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          const restored = parseManuscriptExport(parsed);
          if (restored) setManuscript(restored);
        }
      } catch { /* An unreadable local draft falls back to the example. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [documentId]);

  useEffect(() => {
    if (!hydrated || saved || saving || saveError) return;
    const timer = window.setTimeout(() => {
      if (!documentId) {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exportManuscript(manuscript))); setSaved(true); }
        catch { setSaveError(t('save.localFailure')); }
        return;
      }
      setSaving(true);
      void saveManuscript(documentId, version.current, manuscript).then(result => {
        if ('error' in result) setSaveError(result.error);
        else {
          version.current = result.version;
          if (latestDraft.current === manuscript) setSaved(true);
        }
      }).catch(() => setSaveError(t('save.cloudFailure')))
        .finally(() => setSaving(false));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [hydrated, manuscript, saved, saving, saveError, documentId, t]);

  useEffect(() => {
    if (saved) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saved]);

  useEffect(() => {
    if (saved && pendingNavigation) router.push(pendingNavigation);
  }, [saved, pendingNavigation, router]);

  function commit(change: (current: Manuscript) => Manuscript) {
    setManuscript((current) => {
      undoStack.current = [...undoStack.current.slice(-49), current];
      redoStack.current = [];
      return change(current);
    });
    setCanUndo(true);
    setCanRedo(false);
    setSaved(false);
    setSaveError(null);
  }

  function updateActive(patch: Partial<Page>) {
    commit((current) => ({
      ...current,
      pages: current.pages.map((page) => {
        if (page.id !== current.activeId) return page;
        const textLayout = patch.textLayout ?? page.textLayout;
        return { ...page, ...patch,
          ...(patch.align && textLayout?.body ? { textLayout: { ...textLayout, body: { ...textLayout.body, align: patch.align } } } : {}),
          ...(patch.decorations ? { artworkVersion: 3 as const, image: undefined, ...(page.image ? { textLayout: { ...textLayout, body: getTextLayout(page, 'body', current.theme) } } : {}) } : {}),
        };
      }),
    }));
  }

  function undo() {
    const previous = undoStack.current.at(-1);
    if (!previous) return;
    setManuscript((current) => { redoStack.current.push(current); return previous; });
    undoStack.current.pop();
    setCanUndo(undoStack.current.length > 0); setCanRedo(true); setSaved(false); setSaveError(null);
  }

  function redo() {
    const next = redoStack.current.at(-1);
    if (!next) return;
    setManuscript((current) => { undoStack.current.push(current); return next; });
    redoStack.current.pop();
    setCanRedo(redoStack.current.length > 0); setCanUndo(true); setSaved(false); setSaveError(null);
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
    commit((current) => ({ ...current, activeId: id, pages: [...current.pages, { id, title: t('initial.untitled'), body: t('initial.begin'), align: 'left', composition: blankComposition(t('initial.untitled'),t('initial.begin'),Object.fromEntries(['background','behind','page','surface','content','above','foreground'].map(id=>[id,t(`composer.layerNames.${id}`)]))) }] }));
    if (!isCompactWorkspace()) setPagesOpen(true);
    openInspector('inspect');
  }

  function deletePage() {
    if (manuscript.pages.length === 1) return;
    commit((current) => {
      const index = current.pages.findIndex((page) => page.id === current.activeId);
      const pages = current.pages.filter((page) => page.id !== current.activeId);
      return { ...current, pages, activeId: pages[Math.max(0, index - 1)].id };
    });
  }

  function beginArtworkUpload(replaceId?: string) {
    uploadTarget.current = { pageId: active.id, replaceId };
    imageInputRef.current?.click();
  }

  function chooseImage(file?: File) {
    const target = uploadTarget.current;
    if (!file || !target) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 700_000) {
      setOperationError(t('image.invalid')); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const image = reader.result;
      const current = latestDraft.current;
      const page = current.pages.find(page => page.id === target.pageId);
      if (!page) return;
      const c = composePage(page,current.theme,textDefaults,Object.fromEntries([...['background','behind','page','surface','content','above','foreground'].map(id=>[id,t(`composer.layerNames.${id}`)]),...assetIds.map(id=>[id,t(`composer.assets.${id}`)])]));
      const selected = c.elements.find(item=>item.id===target.replaceId);
      if ((selected&&!canEdit(c,selected))||(!selected&&c.elements.length>=100)) return;
      const layer = c.layers.find(l=>l.id==='content'&&!l.locked)??c.layers.find(l=>!l.locked);
      if (!layer) return;
      const id=selected?.id??crypto.randomUUID();
      const elements=selected?c.elements.map(item=>item.id===id?{...item,kind:'image' as const,asset:'uploaded' as const,image}:item):[...c.elements,{...baseElement,id,name:t('composer.assets.uploaded'),kind:'image' as const,asset:'uploaded' as const,image,layerId:layer.id,x:170,y:280,width:220,height:220}];
      const updated={...page,composition:{...c,elements}};
      const candidate={...current,pages:current.pages.map(p=>p.id===page.id?updated:p)};
      if(!manuscriptSchema.safeParse(candidate).success){setOperationError(t('json.tooLarge'));return;}
      commit(()=>candidate);setSelectedIds([id]);setInspectorTab('inspect');

    };
    reader.onerror = () => setOperationError(t('image.invalid'));
    reader.readAsDataURL(file);
  }

  async function exportPng() {
    const page = pageRef.current;
    if (!page || exporting) return;
    if (pageOverflow) { setOperationError(t('inspector.overflow')); return; }
    setExporting(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await Promise.all(Array.from(page.querySelectorAll('img')).map(image => image.decode()));
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
      setOperationError(t('image.exportFailed'));
    } finally {
      setExporting(false);
    }
  }

  function downloadJson() {
    const baseName = manuscript.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    triggerJsonDownload(exportManuscript(manuscript), `${baseName || 'manuscript'}.json`);
  }

  async function runImportJson(file: File) {
    setPendingImport(null);
    setOperationError(null);
    if (file.size > MAX_MANUSCRIPT_JSON_BYTES) {
      setOperationError(t('json.tooLarge'));
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const imported = parseManuscriptExport(parsed);
      if (!imported) throw new Error('Invalid manuscript file');
      commit(() => imported);
      setPagesOpen(true);
      if (isCompactWorkspace()) setInspectorOpen(false);
    } catch (error) {
      console.error('JSON import failed:', error);
      setOperationError(t('json.invalid'));
    }
  }


  return (
    <main className="app-shell" onClickCapture={event => {
      if (saved || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download') || link.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation(link.pathname + link.search + link.hash);
    }}>
      <h1 className="sr-only">{t('srHeading')}</h1>
      <p className="sr-only">{t('srBody')}</p>
      <section className={`canvas-area ${!hydrated ? 'workspace-hydrating' : ''}`} aria-label={t('aria.workspace')} aria-busy={!hydrated}>
        {!hydrated && (
          <div className="workspace-loading" role="status" aria-label={t('loading')}>
            <span className="workspace-loading-toolbar" />
            <span className="workspace-loading-account" />
            <span className="workspace-loading-identity" />
            <span className="workspace-loading-page" />
          </div>
        )}
        <div className="workspace-header">
          <WorkspaceToolbar
            pagesOpen={pagesOpen}
            onTogglePages={togglePages}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onExportPng={() => { void exportPng(); }}
            onExportJson={downloadJson}
            onImportJson={() => importInputRef.current?.click()}
            onFitView={fitPage}
            exporting={exporting}
            extra={<>
              <button type="button" className="composer-tool" title={t('composer.insert')} aria-label={t('composer.insert')} onClick={()=>openInspector('insert')}><Plus size={14}/></button>
              <button type="button" className="composer-tool" title={t('composer.layers')} aria-label={t('composer.layers')} onClick={()=>openInspector('layers')}><Layers size={14}/></button>
              <button type="button" className="composer-tool" title={t('composer.snapHelp')} aria-label={t('composer.snap')} aria-pressed={snapping} onClick={()=>setSnapping(!snapping)}><Magnet size={14}/></button>
            </>}

          />

          <div className="identity-chip floating-chrome">
            {documentId && <><Link href="/dashboard" aria-label={t('navigation.manuscripts')} title={saved ? t('navigation.back') : t('navigation.waiting')} aria-disabled={!saved} onClick={event => { if (!saved) event.preventDefault(); }} className="-ml-1 flex items-center rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"><ChevronLeft size={14}/></Link><span aria-hidden="true" className="h-4 w-px bg-zinc-700"/></>}
            <span className="manuscript-mark" aria-hidden="true"><Sparkles /></span>
            <span className="identity-name" title={manuscript.name}>{manuscript.name}</span>
            <span className="identity-stats">{manuscript.pages.length} · A4</span>
          </div>

          <div className="top-right-actions">
            <WorkspaceAccountChip saved={saved} cloud={Boolean(documentId)} error={Boolean(saveError)} />
          </div>
        </div>

        {saveError && <div role="alert" className="absolute bottom-4 left-1/2 z-40 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-destructive/40 bg-zinc-900 px-4 py-3 text-sm text-zinc-200"><p className="max-w-lg">{saveError}</p><button className="mt-2 underline underline-offset-2" onClick={() => setSaveError(null)}>{t('save.retry')}</button><button className="ml-4 underline underline-offset-2" onClick={downloadJson}>{t('save.download')}</button></div>}
        {operationError && <div role="alert" className="absolute bottom-4 left-1/2 z-40 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-destructive/40 bg-zinc-900 px-4 py-3 text-sm text-zinc-200"><p className="max-w-lg">{operationError}</p><button className="mt-2 underline underline-offset-2" onClick={() => setOperationError(null)}>{t('dismiss')}</button></div>}

        {pagesOpen && (
          <aside ref={pagesPanelRef} tabIndex={-1} className="pages-panel floating-panel focus:outline-none" aria-label={t('aria.pages')}>
            <header><div><strong>{t('pages.heading')}</strong><span>{t('pages.count',{count:manuscript.pages.length})}</span></div><button onClick={() => setPagesOpen(false)} aria-label={t('pages.close')}><X /></button></header>
            <div className="page-list">
              {manuscript.pages.map((page, index) => (
                <button aria-label={t('pages.open',{number:index+1,title:page.title})} key={page.id} className={`page-item ${page.id === active.id ? 'active' : ''}`} onClick={() => { setSelectedIds([]); setManuscript((current) => ({ ...current, activeId: page.id })); }}>
                  <span className={`page-thumbnail theme-${manuscript.theme}`} style={{ backgroundImage: `url(${artPath(page.composition?.elements.find(e=>e.id===page.composition?.surfaceId)?.asset??`${manuscript.theme}-${page.paperVariant ?? 'clean'}`)})`, backgroundSize: 'cover' }}><i /><b /><b /><b /></span>
                  <span className="page-caption"><strong>{String(index + 1).padStart(2, '0')}</strong><span>{page.title}</span></span>
                </button>
              ))}
            </div>
            <footer><Button className="primary-panel-button" onClick={addPage}><FilePlus2 /> {t('pages.add')}</Button></footer>
          </aside>
        )}

        <div className={`page-stage ${inspectorOpen ? 'inspector-visible' : ''} ${pagesOpen ? 'pages-visible' : ''}`}>
          <div className="page-frame" style={{ width: 560 * zoom / 100, height: 792 * zoom / 100 }}>
            <article
              ref={pageRef}
              className="manuscript-page composition-page"
              onKeyDown={event => { if (event.key === 'Escape') setSelectedIds([]); }}
              onPointerDown={event => { if (event.target === event.currentTarget) setSelectedIds([]); }}
              data-exporting={exporting}
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <CompositionCanvas key={active.id} value={composition} selected={selectedIds} snap={snapping} onSelect={ids=>{setSelectedIds(ids);setInspectorTab('inspect');}} onChange={changeComposition}/>

            </article>
          </div>
        </div>

        <div className="zoom-stack floating-chrome" aria-label={t('aria.zoom')}>
          <ToolButton label={t('zoom.in')} onClick={() => setZoom((value) => Math.min(120, value + 8))}><Plus /></ToolButton>
          <ToolButton label={t('zoom.out')} onClick={() => setZoom((value) => Math.max(45, value - 8))}><Minus /></ToolButton>
          <ToolButton label={t('zoom.reset')} onClick={() => setZoom(100)}><Square /></ToolButton>
        </div>

        {!inspectorOpen && <button className="open-inspector floating-chrome" onClick={() => openInspector()}>{t('inspector.open')}</button>}

        {inspectorOpen && (
          <aside ref={inspectorPanelRef} tabIndex={-1} className="inspector floating-panel focus:outline-none" aria-label={t('aria.inspector')}>
            <header><div><strong>{active.title || t('initial.untitled')}</strong><span>{t('inspector.page',{number:activeIndex+1})}</span></div><button onClick={() => setInspectorOpen(false)} aria-label={t('inspector.close')}><X /></button></header>
            <Tabs value={inspectorTab} onValueChange={(value) => setInspectorTab(value as InspectorTab)} className="inspector-tabs-root">
              <TabsList variant="line" className="inspector-tabs">
                {(['inspect','insert','layers'] as const).map(mode=><TabsTrigger key={mode} value={mode}>{t(`composer.${mode}`)}</TabsTrigger>)}
              </TabsList>
              <form className="inspector-form" onSubmit={event=>event.preventDefault()}>
                {(['inspect','insert','layers'] as const).map(mode=><TabsContent key={mode} value={mode} className="inspector-content"><CompositionPanel documentColors={manuscript.pages.flatMap(p=>(p.composition?.elements??[]).filter(e=>e.kind==='text').map(e=>({color:e.color,opacity:e.opacity})))} value={composition} selected={selectedIds} onSelect={setSelectedIds} onChange={changeComposition} mode={mode} onMode={setInspectorTab} onUpload={beginArtworkUpload}/>{mode==='inspect'&&!selectedIds.length&&<><Field label={t('inspector.name')}><input aria-label={t('inspector.name')} value={manuscript.name} maxLength={80} onChange={event=>commit(current=>({...current,name:event.target.value}))}/></Field><details className="composer-about"><summary>{t('inspector.about')}</summary><LegalLinks/></details></>}{pageOverflow&&<p role="alert" className="page-overflow-warning">{t('inspector.overflow')}</p>}</TabsContent>)}

                <footer><button type="button" className="saved-button" disabled><Check /> {saveError ? t('save.notSaved') : saved ? t('save.saved') : t('save.saving')}</button><button type="button" className="trash-button" disabled={manuscript.pages.length === 1} onClick={deletePage} aria-label={t('inspector.delete')}><Trash2 /></button></footer>
              </form>
            </Tabs>
          </aside>
        )}

        <Dialog open={pendingImport !== null} onOpenChange={(open) => { if (!open) setPendingImport(null); }}>
          <DialogContent showCloseButton={false}>
            <DialogTitle className="text-base text-zinc-100">{t('json.replaceTitle')}</DialogTitle>
            <DialogDescription className="text-zinc-400">{t('json.replaceBody')}</DialogDescription>
            <div className="mt-2 flex justify-end gap-2">
              <DialogClose render={<button className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100" />}>
                {t('json.cancel')}
              </DialogClose>
              <button type="button" autoFocus onClick={() => { if (pendingImport) void runImportJson(pendingImport); }} className="rounded-md bg-destructive-fill px-3 py-1.5 text-sm font-medium text-white hover:bg-[#D63F46]">
                {t('json.confirm')}
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <input ref={imageInputRef} hidden type="file" accept="image/*" onChange={(event) => { chooseImage(event.target.files?.[0]); event.target.value = ''; }} />
        <input ref={importInputRef} hidden type="file" accept="application/json,.json" onChange={(event) => { setPendingImport(event.target.files?.[0] ?? null); event.target.value = ''; }} />
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="field"><span>{label}</span>{children}</div>;
}

function ToolButton({ label, onClick, active, disabled, children }: { label: string; onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" className={`tool-button ${active ? 'active' : ''}`} onClick={onClick} disabled={disabled} title={label} aria-label={label}>{children}</button>;
}
