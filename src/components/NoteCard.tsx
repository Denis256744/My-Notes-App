import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { Note } from '../types';
import { formatRelativeDate, formatDateTime } from '../utils/storage';

interface NoteCardProps {
  note: Note;
  onClick: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  const relativeUpdated = formatRelativeDate(note.updated_at);
  const fullUpdated = formatDateTime(note.updated_at);

  return (
    <div
      id={`note-card-${note.id}`}
      onClick={() => onClick(note.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(note.id);
        }
      }}
      className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-800 dark:focus-visible:ring-slate-300"
    >
      <div>
        {/* Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            title={`Last updated: ${fullUpdated}`}
            className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-normal"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Updated {relativeUpdated}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-slate-900 dark:text-white text-lg leading-snug mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 break-words">
          {note.title}
        </h3>

        {/* Content Short Preview */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4 font-normal">
          {note.content ? note.content : <em className="text-slate-400 dark:text-slate-500 not-italic">No additional content</em>}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
        <span className="font-medium text-slate-500 dark:text-slate-400">Click to view note</span>
        <span className="flex items-center text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
};
