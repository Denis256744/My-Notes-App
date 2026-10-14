import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Note, ImportedFile } from '../types';

interface DeleteConfirmModalProps {
  note?: Note | null;
  file?: ImportedFile | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  note,
  file,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || (!note && !file)) return null;

  const isFile = Boolean(file);
  const title = isFile ? file?.name : note?.title;
  const itemType = isFile ? 'file' : 'note';

  return (
    <div
      id="delete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        id="delete-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative text-left transition-colors duration-200"
      >
        {/* Close icon button */}
        <button
          id="delete-modal-close-icon"
          onClick={onCancel}
          className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/60">
          <AlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>

        {/* Confirmation Heading */}
        <h2
          id="delete-modal-title"
          className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight mb-2"
        >
          Are you sure you want to delete this {itemType}?
        </h2>

        {/* Item preview */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-3 mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
            {itemType === 'file' ? 'File to be deleted:' : 'Note to be deleted:'}
          </p>
          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {title}
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
          This action cannot be undone. The {itemType} will be permanently removed from persistent storage.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            id="delete-modal-cancel-btn"
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            id="delete-modal-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete {itemType === 'file' ? 'File' : 'Note'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
