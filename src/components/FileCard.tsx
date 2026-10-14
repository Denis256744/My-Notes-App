import React, { useState } from 'react';
import { Download, Trash2, Eye, Share2, FileText, Check } from 'lucide-react';
import { ImportedFile } from '../types';
import { formatFileSize, getFileCategory, getCategoryBadge } from '../utils/fileHelper';
import { formatRelativeDate } from '../utils/storage';
import { FileIcon } from './FileIcon';

interface FileCardProps {
  file: ImportedFile;
  onPreview: (file: ImportedFile) => void;
  onExport: (file: ImportedFile) => void;
  onDeleteRequest: (file: ImportedFile) => void;
  onConvertToNote?: (file: ImportedFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPreview,
  onExport,
  onDeleteRequest,
  onConvertToNote,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const category = getFileCategory(file.extension, file.type);
  const badge = getCategoryBadge(category);
  const isTextConvertible = ['text', 'excel'].includes(category) || ['txt', 'csv', 'md'].includes(file.extension);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Badge & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {formatRelativeDate(file.updated_at || file.created_at)}
          </span>
        </div>

        {/* File Details: Icon & Name */}
        <div className="flex items-start gap-3">
          <FileIcon extension={file.extension} mimeType={file.type} size="md" />

          <div className="min-w-0 flex-1">
            <h3
              className="font-display font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 break-all group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
              title={file.name}
            >
              {file.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span className="uppercase font-mono text-[10px] text-slate-400">
                .{file.extension || 'FILE'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Preview Button */}
          <button
            type="button"
            onClick={() => onPreview(file)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View or preview file"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View</span>
          </button>

          {/* Optional Convert to Note */}
          {isTextConvertible && onConvertToNote && (
            <button
              type="button"
              onClick={() => onConvertToNote(file)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              title="Convert content into an editable note"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Make Note</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Export / Save to Device Button */}
          <button
            type="button"
            onClick={() => onExport(file)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Export / Save to device"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span>Export</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDeleteRequest(file)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete file"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
