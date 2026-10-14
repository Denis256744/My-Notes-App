import React from 'react';
import {
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  Music,
  Video,
  Archive,
  File,
  Presentation,
} from 'lucide-react';
import { getFileCategory, FileCategory } from '../utils/fileHelper';

interface FileIconProps {
  extension: string;
  mimeType?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FileIcon: React.FC<FileIconProps> = ({
  extension,
  mimeType = '',
  className = '',
  size = 'md',
}) => {
  const category: FileCategory = getFileCategory(extension, mimeType);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const iconClass = sizeClasses[size];

  switch (category) {
    case 'pdf':
      return (
        <div className={`${containerSizes[size]} bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 ${className}`}>
          <FileText className={iconClass} />
        </div>
      );
    case 'word':
      return (
        <div className={`${containerSizes[size]} bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ${className}`}>
          <FileText className={iconClass} />
        </div>
      );
    case 'excel':
      return (
        <div className={`${containerSizes[size]} bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ${className}`}>
          <FileSpreadsheet className={iconClass} />
        </div>
      );
    case 'powerpoint':
      return (
        <div className={`${containerSizes[size]} bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 ${className}`}>
          <Presentation className={iconClass} />
        </div>
      );
    case 'image':
      return (
        <div className={`${containerSizes[size]} bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 ${className}`}>
          <Image className={iconClass} />
        </div>
      );
    case 'audio':
      return (
        <div className={`${containerSizes[size]} bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ${className}`}>
          <Music className={iconClass} />
        </div>
      );
    case 'video':
      return (
        <div className={`${containerSizes[size]} bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 ${className}`}>
          <Video className={iconClass} />
        </div>
      );
    case 'archive':
      return (
        <div className={`${containerSizes[size]} bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 ${className}`}>
          <Archive className={iconClass} />
        </div>
      );
    case 'text':
      return (
        <div className={`${containerSizes[size]} bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 ${className}`}>
          <FileCode className={iconClass} />
        </div>
      );
    default:
      return (
        <div className={`${containerSizes[size]} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 ${className}`}>
          <File className={iconClass} />
        </div>
      );
  }
};
