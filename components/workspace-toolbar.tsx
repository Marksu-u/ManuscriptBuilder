'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportOpen]);

  return (
    <div className="absolute left-4 top-4 z-20 flex items-center gap-0.5 rounded-lg border border-zinc-700 bg-zinc-900/95 p-1 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={onFitView}
        className="cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        title="Fit page"
        aria-label="Fit page"
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
        title="Pages"
        aria-label="Pages"
      >
        <Files size={14} />
      </button>

      <div className="mx-0.5 h-5 w-px bg-zinc-700" />

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 size={14} />
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 size={14} />
      </button>

      <div className="mx-0.5 h-5 w-px bg-zinc-700" />

      <div ref={exportRef} className="relative">
        <button
          type="button"
          onClick={() => setExportOpen((open) => !open)}
          className="flex items-center gap-1 rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-wait disabled:opacity-50"
          title="Export"
          aria-label="Export"
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
              Export PNG
            </button>
            <button
              type="button"
              onClick={() => { setExportOpen(false); onExportJson(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Download JSON
            </button>
            <div className="my-1 h-px bg-zinc-700" />
            <button
              type="button"
              onClick={() => { setExportOpen(false); onImportJson(); }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Upload size={12} />
              Import JSON
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
    </div>
  );
}
