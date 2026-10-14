import React from 'react';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';
import { Note } from '../types';
import { formatDateTime } from '../utils/storage';

interface NoteDetailViewProps {
  note: Note;
  onBack: () => void;
  onEdit: (noteId: string) => void;
  onDeleteRequest: (note: Note) => void;
  onShowToast?: (message: string) => void;
}

export const NoteDetailView: React.FC<NoteDetailViewProps> = ({
  note,
  onBack,
  onEdit,
  onDeleteRequest,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-16 px-0">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2.5 sm:gap-4">
        <button
          id="note-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-800 dark:focus-visible:ring-slate-200 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="note-detail-edit-btn"
            onClick={() => onEdit(note.id)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-800 dark:focus-visible:ring-slate-200 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
            <span>Edit</span>
          </button>

          <button
            id="note-detail-delete-btn"
            onClick={() => onDeleteRequest(note)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Note Card Content */}
      <article className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-xs space-y-5 sm:space-y-6 transition-colors duration-200 overflow-hidden break-words">
        {/* Header: Dates */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0" title="Date Created">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate">Created: <strong className="text-slate-700 dark:text-slate-200 font-medium">{formatDateTime(note.created_at)}</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <div className="flex items-center gap-1.5 min-w-0" title="Date Last Updated">
            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate">Updated: <strong className="text-slate-700 dark:text-slate-200 font-medium">{formatDateTime(note.updated_at)}</strong></span>
          </div>
        </div>

        {/* Note Title */}
        <h1
          id="note-detail-title"
          className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-snug break-words"
        >
          {note.title}
        </h1>

        {/* Note Full Content */}
        <div
          id="note-detail-content"
          className="text-slate-700 dark:text-slate-200 text-sm sm:text-base md:text-[17px] leading-relaxed whitespace-pre-wrap font-normal break-words selection:bg-amber-100 dark:selection:bg-amber-900 selection:text-slate-900 dark:selection:text-amber-100"
        >
          {note.content ? (
            note.content
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic">This note has no written content.</p>
          )}
        </div>
      </article>
    </div>
  );
};
