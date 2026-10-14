import React, { useEffect, useState } from 'react';
import { X, Download, Share2, FileText, Calendar, HardDrive, FileCheck } from 'lucide-react';
import { ImportedFile } from '../types';
import { formatFileSize, getFileCategory, getCategoryBadge } from '../utils/fileHelper';
import { formatDateTime } from '../utils/storage';
import { FileIcon } from './FileIcon';

interface FilePreviewModalProps {
  file: ImportedFile | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (file: ImportedFile) => void;
  onConvertToNote?: (file: ImportedFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onExport,
  onConvertToNote,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  useEffect(() => {
    if (!isOpen || !file || !file.data) {
      setObjectUrl(null);
      setTextContent(null);
      return;
    }

    const category = getFileCategory(file.extension, file.type);

    // Create object URL for media/preview
    const url = URL.createObjectURL(file.data);
    setObjectUrl(url);

    // If text file, read content
    if (category === 'text' || ['txt', 'csv', 'md', 'json', 'log'].includes(file.extension)) {
      setIsLoadingText(true);
      file.data
        .text()
        .then((txt) => {
          setTextContent(txt);
          setIsLoadingText(false);
        })
        .catch(() => {
          setIsLoadingText(false);
        });
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const category = getFileCategory(file.extension, file.type);
  const badge = getCategoryBadge(category);
  const isTextConvertible = ['text', 'excel'].includes(category) || ['txt', 'csv', 'md'].includes(file.extension);

  return (
    <div
      id="file-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="file-preview-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-preview-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative text-left max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon extension={file.extension} mimeType={file.type} size="md" />
            <div className="min-w-0">
              <h2
                id="file-preview-title"
                className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate"
                title={file.name}
              >
                {file.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Image Preview */}
          {category === 'image' && objectUrl && (
            <div className="bg-slate-100 dark:bg-slate-950/60 rounded-xl p-2 flex items-center justify-center min-h-[220px] max-h-[420px] overflow-hidden">
              <img
                src={objectUrl}
                alt={file.name}
                className="max-h-[380px] max-w-full object-contain rounded-lg shadow-xs"
              />
            </div>
          )}

          {/* Audio Preview */}
          {category === 'audio' && objectUrl && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audio Playback</p>
              <audio controls src={objectUrl} className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {/* Video Preview */}
          {category === 'video' && objectUrl && (
            <div className="bg-slate-950 rounded-2xl overflow-hidden max-h-[380px] flex items-center justify-center">
              <video controls src={objectUrl} className="max-h-[360px] max-w-full">
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {/* Text / CSV Preview */}
          {(category === 'text' || ['txt', 'csv', 'md'].includes(file.extension)) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Content Preview:</span>
                {isTextConvertible && onConvertToNote && (
                  <button
                    type="button"
                    onClick={() => onConvertToNote(file)}
                    className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create Note from this Text</span>
                  </button>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed">
                {isLoadingText ? (
                  <p className="text-slate-400">Loading text content...</p>
                ) : textContent !== null ? (
                  textContent || <span className="italic text-slate-400">Empty file.</span>
                ) : (
                  <p className="text-slate-400">Could not read text content.</p>
                )}
              </div>
            </div>
          )}

          {/* PDF Preview Notice */}
          {category === 'pdf' && (
            <div className="bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                PDF Document Preserved
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                This PDF is stored bit-for-bit in persistent storage. You can export or open it using your device's native PDF reader.
              </p>
              {objectUrl && (
                <a
                  href={objectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Open in PDF Viewer</span>
                </a>
              )}
            </div>
          )}

          {/* Office / Archive / Other Binary Notice */}
          {['word', 'excel', 'powerpoint', 'archive', 'generic'].includes(category) && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mx-auto flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Original Binary File Preserved
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                The original <strong>.{file.extension}</strong> file and filename are stored safely in persistent storage without corruption. Export it anytime to open in its native application on your device.
              </p>
            </div>
          )}

          {/* Metadata info cards */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium">Import Date</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDateTime(file.created_at)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                <HardDrive className="w-3.5 h-3.5" />
                <span className="font-medium">File Size & MIME</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate" title={file.type}>
                {formatFileSize(file.size)} ({file.type || 'file'})
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {isTextConvertible && onConvertToNote && (
              <button
                type="button"
                onClick={() => onConvertToNote(file)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Create Note</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => onExport(file)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export / Save to Device</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
