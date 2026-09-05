'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  Download,
  Files,
  Maximize2,
  Redo2,
  Undo2,
  Upload,
} from 'lucide-react';

interface WorkspaceToolbarProps {
  pagesOpen: boolean;
  onTogglePages: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onFitView: () => void;
  exporting?: boolean;
  extra?: React.ReactNode;
}

export function WorkspaceToolbar({
  pagesOpen,
  onTogglePages,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPng,
  onExportJson,
  onImportJson,
  onFitView,
  exporting = false,
  extra,
}: WorkspaceToolbarProps) {
  const t = useTranslations('workspace.toolbar');
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setExportOpen(false);
        exportRef.current?.querySelector('button')?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [exportOpen]);

  return (
    <nav aria-label={t('aria')} className="workspace-toolbar flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900/95 p-1 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={onFitView}
        className="cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        title={t('fit')}
        aria-label={t('fit')}
      >
        <Maximize2 size={14} />
      </button>

      <button
        type="button"
        onClick={onTogglePages}
        className={[
          'rounded p-1.5 transition-colors',
          pagesOpen
            ? 'bg-zinc-800 text-zinc-200'
            : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300',
        ].join(' ')}
        title={t('pages')}
        aria-label={t('pages')}
        aria-pressed={pagesOpen}
      >
        <Files size={14} />
      </button>

      <div className="mx-0.5 h-5 w-px bg-zinc-700" />

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        title={t('undo')}
        aria-label={t('undo')}
      >
        <Undo2 size={14} />
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        title={t('redo')}
        aria-label={t('redo')}
      >
        <Redo2 size={14} />
      </button>

      <div className="mx-0.5 h-5 w-px bg-zinc-700" />

      <div ref={exportRef} className="relative">
        <button
          type="button"
          onClick={() => setExportOpen((open) => !open)}
          className="flex items-center gap-1 rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-wait disabled:opacity-50"
          title={t('export')}
          aria-label={t('export')}
          aria-expanded={exportOpen}
          disabled={exporting}
        >
          <Download size={14} />
          <ChevronDown size={11} />
        </button>

        {exportOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 py-1 shadow-lg">
            <button
              type="button"
              onClick={() => { setExportOpen(false); onExportPng(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              {t('png')}
            </button>
            <button
              type="button"
              onClick={() => { setExportOpen(false); onExportJson(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              {t('json')}
            </button>
            <div className="my-1 h-px bg-zinc-700" />
            <button
              type="button"
              onClick={() => { setExportOpen(false); onImportJson(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Upload size={12} />
              {t('import')}
            </button>
          </div>
        )}
      </div>

      {extra && (
        <>
          <div className="mx-0.5 h-5 w-px bg-zinc-700" />
          {extra}
        </>
      )}
    </nav>
  );
}
