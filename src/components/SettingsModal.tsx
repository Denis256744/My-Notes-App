import React, { useRef, useState } from 'react';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  Check,
  FileText,
  AlertCircle,
  FolderOpen,
  FileDown,
} from 'lucide-react';
import { Note, ThemeMode, ImportedFile } from '../types';
import { formatFileSize } from '../utils/fileHelper';
import { exportNotesAsJson, shareOrSaveFile } from '../utils/exportHelper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  notes: Note[];
  files?: ImportedFile[];
  onImportNotes: (importedNotes: Note[]) => void;
  onImportFiles: (filesList: FileList | File[]) => void;
  onClearAllNotes?: () => void;
  onClearAllFiles?: () => void;
  onShowToast: (message: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  notes,
  files = [],
  onImportNotes,
  onImportFiles,
  onClearAllNotes,
  onClearAllFiles,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearFilesConfirm, setShowClearFilesConfirm] = useState(false);

  if (!isOpen) return null;

  // Handle Export Notes JSON
  const handleExportJson = () => {
    try {
      exportNotesAsJson(notes);
      onShowToast(`Exported ${notes.length} note${notes.length === 1 ? '' : 's'} successfully`);
    } catch (err) {
      console.error('Export failed:', err);
      onShowToast('Failed to export notes');
    }
  };

  // Handle Export All Notes as a consolidated Text file
  const handleExportAllNotesTxt = async () => {
    try {
      if (notes.length === 0) {
        onShowToast('No notes available to export');
        return;
      }

      const separator = '\n' + '='.repeat(50) + '\n';
      const fullText = notes
        .map((n) => `TITLE: ${n.title}\nCREATED: ${n.created_at}\nUPDATED: ${n.updated_at}\n\n${n.content}`)
        .join(separator);

      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `my-notes-all-${dateStr}.txt`;

      await shareOrSaveFile(blob, filename, 'My Notes Archive');
      onShowToast('Notes exported as text file');
    } catch (err) {
      console.error('Export all notes as TXT failed:', err);
      onShowToast('Failed to export notes as text');
    }
  };

  // Handle file select from native phone / device picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setImportError(null);

    // Check if user selected a JSON notes backup
    const firstFile = selectedFiles[0];
    if (selectedFiles.length === 1 && (firstFile.name.endsWith('.json') || firstFile.type === 'application/json')) {
      try {
        const content = await firstFile.text();
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0]?.title === 'string') {
          // It's a notes backup! Import into notes
          const validNotes: Note[] = [];
          for (const item of parsed) {
            if (typeof item === 'object' && item !== null && typeof item.title === 'string') {
              validNotes.push({
                id: typeof item.id === 'string' ? item.id : `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                title: item.title,
                content: typeof item.content === 'string' ? item.content : '',
                created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
                updated_at: typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString(),
              });
            }
          }

          if (validNotes.length > 0) {
            onImportNotes(validNotes);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }
        }
      } catch {
        // If parsing JSON fails, fall back to treating it as an imported file
      }
    }

    // Otherwise, import all files persistently to Files store preserving original format and name
    onImportFiles(selectedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalFilesBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="settings-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2
              id="settings-modal-title"
              className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight"
            >
              Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize appearance and manage your notes & files backup
            </p>
          </div>
          <button
            id="settings-modal-close-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Theme Selection Section */}
          <section className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance & Theme
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* Light Mode */}
              <button
                type="button"
                id="theme-select-light"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    Light
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Crisp & bright
                  </span>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                id="theme-select-dark"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  theme === 'dark'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-amber-300 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  {theme === 'dark' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    Dark
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Easy on eyes
                  </span>
                </div>
              </button>

              {/* System Theme */}
              <button
                type="button"
                id="theme-select-system"
                onClick={() => onThemeChange('system')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                  theme === 'system'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  {theme === 'system' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white block">
                    System
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Device auto
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* Backup & Import/Export Section */}
          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Import & Export
            </label>

            {/* Android / Device File Import & Backup Export options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Import Files Button (Native Android / Device Picker) */}
              <button
                type="button"
                id="settings-import-files-btn"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    Import Files
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    PDF, DOC, Images, Audio, ZIP
                  </span>
                </div>
              </button>

              {/* Export JSON Backup */}
              <button
                type="button"
                id="settings-export-json-btn"
                onClick={handleExportJson}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    Export Backup (JSON)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Save full notes backup
                  </span>
                </div>
              </button>

              {/* Export All Notes TXT */}
              <button
                type="button"
                id="settings-export-txt-btn"
                onClick={handleExportAllNotesTxt}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all hover:bg-slate-100/70 dark:hover:bg-slate-800/70 sm:col-span-2"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white block">
                    Export All Notes as Text (.txt)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Share or download all notes in readable plain text
                  </span>
                </div>
              </button>
            </div>

            {/* Hidden file input with universal multi-file picker for Android & Desktop */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {importError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}
          </section>

          {/* Storage Section */}
          <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Persistent Storage
            </label>

            {/* Notes Storage */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">
                    {notes.length} note{notes.length === 1 ? '' : 's'} stored
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Persistent IndexedDB database
                  </span>
                </div>
              </div>

              {onClearAllNotes && notes.length > 0 && (
                !showClearConfirm ? (
                  <button
                    type="button"
                    id="settings-clear-notes-btn"
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium text-red-600 dark:text-red-400 transition-colors self-start sm:self-auto"
                  >
                    <span>Clear Notes</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllNotes();
                        setShowClearConfirm(false);
                      }}
                      className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
                    >
                      Confirm
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Files Storage */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white block">
                    {files.length} attached file{files.length === 1 ? '' : 's'} ({formatFileSize(totalFilesBytes)})
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Original binary files preserved
                  </span>
                </div>
              </div>

              {onClearAllFiles && files.length > 0 && (
                !showClearFilesConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearFilesConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium text-red-600 dark:text-red-400 transition-colors self-start sm:self-auto"
                  >
                    <span>Clear Files</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowClearFilesConfirm(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllFiles();
                        setShowClearFilesConfirm(false);
                      }}
                      className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
                    >
                      Confirm
                    </button>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        {/* Footer Done */}
        <div className="mt-7 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            id="settings-modal-done-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs sm:text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
