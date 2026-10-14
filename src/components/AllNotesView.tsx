import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, FolderOpen, X, ArrowUpDown } from 'lucide-react';
import { Note, ViewMode } from '../types';
import { NoteCard } from './NoteCard';

interface AllNotesViewProps {
  notes: Note[];
  onOpenNote: (noteId: string) => void;
  onNavigate: (view: ViewMode) => void;
  initialSearchQuery?: string;
}

export const AllNotesView: React.FC<AllNotesViewProps> = ({
  notes,
  onOpenNote,
  onNavigate,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync initial search query if changed and auto-focus search input
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
    // Auto-focus the search bar when the view opens so user can immediately type
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [initialSearchQuery]);

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          if (!matchTitle && !matchContent) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updated') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        if (sortBy === 'created') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [notes, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
            My Notes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Displaying {filteredNotes.length} of {notes.length} total note{notes.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          id="allnotes-btn-new-note"
          onClick={() => onNavigate('create')}
          className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-amber-400"
        >
          <Plus className="w-4 h-4 text-amber-300 dark:text-slate-950 stroke-[2.5]" />
          <span>+ New Note</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors duration-200">
        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              ref={searchInputRef}
              id="allnotes-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title or content..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all"
            />
            {searchQuery && (
              <button
                id="allnotes-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-medium">
              <button
                id="sort-by-updated-btn"
                type="button"
                onClick={() => setSortBy('updated')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'updated'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Updated
              </button>
              <button
                id="sort-by-created-btn"
                type="button"
                onClick={() => setSortBy('created')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'created'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Created
              </button>
              <button
                id="sort-by-title-btn"
                type="button"
                onClick={() => setSortBy('title')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sortBy === 'title'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Title A-Z
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid or Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
            {searchQuery ? 'No matching notes found' : 'No notes saved yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-5">
            {searchQuery
              ? 'No notes match your current search. Try clearing your search keyword.'
              : 'Create your first note to begin capturing reminders, ideas, tasks, and notes.'}
          </p>

          {searchQuery && (
            <button
              id="allnotes-clear-search-btn"
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}

          {!searchQuery && (
            <button
              id="allnotes-empty-new-note-btn"
              type="button"
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl text-sm font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-300 dark:text-slate-950" />
              <span>+ Create Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={onOpenNote} />
          ))}
        </div>
      )}
    </div>
  );
};
