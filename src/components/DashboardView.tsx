import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  FolderOpen,
  ArrowRight,
  X,
  Upload,
  FileText,
} from 'lucide-react';
import { Note, ViewMode, ImportedFile } from '../types';
import { NoteCard } from './NoteCard';
import { FileCard } from './FileCard';

interface DashboardViewProps {
  notes: Note[];
  files?: ImportedFile[];
  onOpenNote: (noteId: string) => void;
  onNavigate: (view: ViewMode) => void;
  onTriggerImport: () => void;
  onPreviewFile: (file: ImportedFile) => void;
  onExportFile: (file: ImportedFile) => void;
  onDeleteFileRequest: (file: ImportedFile) => void;
  onConvertToNote?: (file: ImportedFile) => void;
  onOpenSearch?: (query?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  files = [],
  onOpenNote,
  onNavigate,
  onTriggerImport,
  onPreviewFile,
  onExportFile,
  onDeleteFileRequest,
  onConvertToNote,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');

  // Trigger opening the main search interface
  const handleTriggerSearch = (queryToUse?: string) => {
    const q = queryToUse !== undefined ? queryToUse : searchQuery;
    if (onOpenSearch) {
      onOpenSearch(q);
    } else {
      onNavigate('all-notes');
    }
  };

  // Calculate sorted recent notes
  const recentNotes = useMemo(() => {
    return [...notes].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [notes]);

  // Calculate sorted recent files
  const recentFiles = useMemo(() => {
    return [...files].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [files]);

  // Search filtered results for instant inline preview
  const searchResultsNotes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const searchResultsFiles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return files.filter(
      (f) => f.name.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const displayNotes = searchQuery.trim() ? searchResultsNotes : recentNotes.slice(0, 6);
  const displayFiles = searchQuery.trim() ? searchResultsFiles : recentFiles.slice(0, 6);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Personal Workspace</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              My Notes & Files
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-base max-w-xl">
              Organize your thoughts, text notes, and imported documents in one safe, persistent place.
            </p>
          </div>

          {/* Quick Action & Stats pill */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Notes Stat Pill */}
            <button
              type="button"
              id="dashboard-total-notes-stat"
              onClick={() => onNavigate('all-notes')}
              className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[90px] transition-colors cursor-pointer"
              title="View all notes"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Notes
              </span>
              <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">
                {notes.length}
              </span>
            </button>

            {/* Files Stat Pill */}
            <button
              type="button"
              id="dashboard-total-files-stat"
              onClick={() => onNavigate('files')}
              className="bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-4 py-2.5 rounded-2xl flex flex-col items-center justify-center min-w-[90px] transition-colors cursor-pointer"
              title="View all imported files"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Files
              </span>
              <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight">
                {files.length}
              </span>
            </button>

            {/* Search Button in Actions Bar */}
            <button
              type="button"
              id="dashboard-btn-search"
              onClick={() => handleTriggerSearch()}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
              title="Open search interface"
            >
              <Search className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Search</span>
            </button>

            {/* Import Files Action */}
            <button
              type="button"
              id="dashboard-btn-import-file"
              onClick={onTriggerImport}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Select and import files from device"
            >
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Import Files</span>
            </button>

            {/* New Note Action */}
            <button
              type="button"
              id="dashboard-btn-new-note"
              onClick={() => onNavigate('create')}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow-sm transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-amber-400 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300 dark:text-slate-950 stroke-[2.5]" />
              <span>+ New Note</span>
            </button>
          </div>
        </div>

        {/* Search Bar with Clickable Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTriggerSearch(searchQuery);
            }}
            className="relative flex items-center"
          >
            {/* Clickable search icon button */}
            <button
              type="button"
              id="dashboard-search-icon-btn"
              onClick={() => handleTriggerSearch(searchQuery)}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer z-20"
              title="Open search"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Search input */}
            <input
              id="dashboard-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all notes and files..."
              className="w-full pl-11 sm:pl-12 pr-24 sm:pr-28 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-hidden focus:ring-3 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all relative z-10"
            />

            {/* Action buttons inside search bar: Clear + Submit/Open Search Button */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
              {searchQuery && (
                <button
                  type="button"
                  id="dashboard-search-clear"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              <button
                type="submit"
                id="dashboard-search-submit-btn"
                onClick={() => handleTriggerSearch(searchQuery)}
                className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Search notes"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Tabs to clearly distinguish between Notes and Attached/Imported Files */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="dashboard-tab-notes"
            onClick={() => setActiveTab('notes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes ({searchQuery.trim() ? searchResultsNotes.length : notes.length})</span>
          </button>

          <button
            type="button"
            id="dashboard-tab-files"
            onClick={() => setActiveTab('files')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Imported Files ({searchQuery.trim() ? searchResultsFiles.length : files.length})</span>
          </button>
        </div>

        {activeTab === 'notes' ? (
          <button
            id="dashboard-view-all-notes-link"
            onClick={() => onNavigate('all-notes')}
            className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 group py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>View all notes ({notes.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            id="dashboard-view-all-files-link"
            onClick={() => onNavigate('files')}
            className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 group py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>View all files ({files.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'notes' ? (
        <section>
          {displayNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
                {searchQuery ? 'No matching notes found' : 'No notes yet'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-5">
                {searchQuery
                  ? `We couldn't find any notes matching "${searchQuery}". Try a different keyword or check the Files tab.`
                  : 'Get started by creating your first personal note to track tasks, ideas, or reminders.'}
              </p>
              {searchQuery ? (
                <button
                  id="dashboard-clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  id="dashboard-empty-new-note-btn"
                  onClick={() => onNavigate('create')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300 dark:text-slate-950" />
                  <span>+ Create Your First Note</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayNotes.map((note) => (
                <NoteCard key={note.id} note={note} onClick={onOpenNote} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          {displayFiles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
                {searchQuery ? 'No matching files found' : 'No imported files yet'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-5">
                {searchQuery
                  ? `No files match "${searchQuery}".`
                  : 'Import PDF, DOC, Excel, PowerPoint, images, audio, video, or ZIP files from your device.'}
              </p>
              <button
                type="button"
                onClick={onTriggerImport}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Select & Import Files</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {displayFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPreview={onPreviewFile}
                  onExport={onExportFile}
                  onDeleteRequest={onDeleteFileRequest}
                  onConvertToNote={onConvertToNote}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
