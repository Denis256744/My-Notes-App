/**
 * File utility helpers for file formatting, categories, and icon assignments
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${formatted} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  return '';
}

export type FileCategory =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'generic';

export function getFileCategory(extension: string, mimeType: string = ''): FileCategory {
  const ext = extension.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || mime.includes('word') || mime.includes('officedocument.wordprocessing')) return 'word';
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return 'excel';
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) return 'powerpoint';
  if (['txt', 'text', 'md', 'markdown', 'log', 'json', 'xml'].includes(ext) || mime.startsWith('text/')) return 'text';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext) || mime.startsWith('audio/')) return 'audio';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', '3gp'].includes(ext) || mime.startsWith('video/')) return 'video';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) || mime.includes('zip') || mime.includes('compressed') || mime.includes('tar')) return 'archive';

  return 'generic';
}

export function getCategoryBadge(category: FileCategory): { label: string; bg: string; text: string; border: string } {
  switch (category) {
    case 'pdf':
      return { label: 'PDF Document', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-900/60' };
    case 'word':
      return { label: 'Word Document', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-900/60' };
    case 'excel':
      return { label: 'Spreadsheet', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/60' };
    case 'powerpoint':
      return { label: 'Presentation', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-900/60' };
    case 'image':
      return { label: 'Image', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-900/60' };
    case 'audio':
      return { label: 'Audio', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/60' };
    case 'video':
      return { label: 'Video', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/60' };
    case 'archive':
      return { label: 'Archive', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' };
    case 'text':
      return { label: 'Text / Note', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-900/60' };
    default:
      return { label: 'File', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
  }
}
