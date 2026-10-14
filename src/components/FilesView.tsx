import React, { useState, useMemo } from 'react';
import { Search, Upload, FolderOpen, X, ArrowUpDown, Filter } from 'lucide-react';
import { ImportedFile } from '../types';
import { FileCard } from './FileCard';
import { formatFileSize, getFileCategory } from '../utils/fileHelper';

interface FilesViewProps {
  files: ImportedFile[];
  onTriggerImport: () => void;
  onPreviewFile: (file: ImportedFile) => void;
  onExportFile: (file: ImportedFile) => void;
  onDeleteRequest: (file: ImportedFile) => void;
  onConvertToNote?: (file: ImportedFile) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  onTriggerImport,
  onPreviewFile,
  onExportFile,
  onDeleteRequest,
  onConvertToNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'size'>('recent');

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Category filter
        if (selectedFilter !== 'all') {
          const cat = getFileCategory(file.extension, file.type);
          if (selectedFilter === 'docs' && !['pdf', 'word', 'excel', 'powerpoint', 'text'].includes(cat)) {
            return false;
          }
          if (selectedFilter === 'media' && !['image', 'audio', 'video'].includes(cat)) {
            return false;
          }
          if (selectedFilter === 'archives' && cat !== 'archive') {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = file.name.toLowerCase().includes(q);
          const matchExt = file.extension.toLowerCase().includes(q);
          if (!matchName && !matchExt) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'size') {
          return b.size - a.size;
        }
        return 0;
      });
  }, [files, searchQuery, selectedFilter, sortBy]);

  const totalBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [files]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
            Imported Files
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Displaying {filteredFiles.length} of {files.length} saved file{files.length === 1 ? '' : 's'} ({formatFileSize(totalBytes)} total)
          </p>
        </div>

        <button
          type="button"
          id="files-view-import-btn"
          onClick={onTriggerImport}
          className="self-start sm:self-auto bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-xs transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-amber-400"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>+ Import Files</span>
        </button>
      </div>

      {/* Toolbar: Search, Filters & Sort */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="files-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by name or extension (.pdf, .docx, .png)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
            </div>
            <select
              id="files-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'size')}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 py-2.5 px-3 focus:outline-hidden focus:border-slate-400 cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Largest Size</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Files' },
            { id: 'docs', label: 'Documents (PDF, Office, Text)' },
            { id: 'media', label: 'Media (Images, Audio, Video)' },
            { id: 'archives', label: 'Archives (ZIP)' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedFilter === f.id
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-semibold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid or Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3.5">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-lg mb-1">
            {searchQuery || selectedFilter !== 'all' ? 'No matching files found' : 'No imported files yet'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            {searchQuery || selectedFilter !== 'all'
              ? 'Try changing your search query or switching your file type filter.'
              : 'Select documents, PDFs, spreadsheets, presentations, photos, audio, videos, or archives directly from your Android phone or computer storage.'}
          </p>

          <div className="flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              onClick={onTriggerImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Select & Import Files</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onPreview={onPreviewFile}
              onExport={onExportFile}
              onDeleteRequest={onDeleteRequest}
              onConvertToNote={onConvertToNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};
