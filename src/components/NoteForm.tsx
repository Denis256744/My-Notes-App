import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Note } from '../types';

interface NoteFormProps {
  initialNote?: Note | null;
  onSave: (data: { title: string; content: string }) => void;
  onCancel: () => void;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  initialNote,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialNote);
  const [title, setTitle] = useState(initialNote ? initialNote.title : '');
  const [content, setContent] = useState(initialNote ? initialNote.content : '');
  const [error, setError] = useState<string | null>(null);
  const [, setTouched] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
    }
  }, [initialNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required. Please enter a note title.');
      return;
    }

    setError(null);
    onSave({
      title: trimmedTitle,
      content: content.trim(),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Navigation / Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="note-form-cancel-top-btn"
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-800 dark:focus-visible:ring-slate-200"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Cancel</span>
        </button>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {isEditing ? 'Editing Note' : 'Drafting Note'}
        </span>
      </div>

      {/* Form Container */}
      <form
        id="note-form"
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-xs space-y-5 sm:space-y-6 transition-colors duration-200"
      >
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            {isEditing ? 'Edit Note' : 'Create New Note'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isEditing
              ? 'Update the title or content of this note.'
              : 'Add a new personal note to your collection.'}
          </p>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="note-title-input"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="note-title-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error && e.target.value.trim()) {
                setError(null);
              }
            }}
            placeholder="e.g., Biology Exam Preparation"
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-base text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition-all ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-3 focus:ring-red-100 dark:focus:ring-red-950/40'
                : 'border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-600 focus:ring-3 focus:ring-slate-100 dark:focus:ring-slate-800'
            }`}
            autoFocus
          />
          {error && (
            <p
              id="note-title-error"
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1 font-medium"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Content Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="note-content-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              Content
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
              {content.length} character{content.length === 1 ? '' : 's'}
            </span>
          </div>
          <textarea
            id="note-content-input"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note thoughts, key points, checklist, or details here..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 dark:focus:border-slate-600 focus:outline-hidden focus:ring-3 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all font-normal resize-y"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            id="note-form-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            id="note-form-save-btn"
            type="submit"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-amber-500 dark:hover:bg-amber-400 dark:active:bg-amber-600 text-white dark:text-slate-950 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-amber-400"
          >
            <Save className="w-4 h-4 text-amber-300 dark:text-slate-950" />
            <span>Save Note</span>
          </button>
        </div>
      </form>
    </div>
  );
};
