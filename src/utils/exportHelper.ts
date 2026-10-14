import { jsPDF } from 'jspdf';
import { Note, ImportedFile } from '../types';
import { formatDateTime } from './storage';

/**
 * Checks if the Web Share API can share the provided file (supported on Android Chrome/PWA/WebView).
 */
export function canShareFiles(file: File): boolean {
  try {
    if (typeof navigator !== 'undefined' && 'canShare' in navigator && typeof navigator.canShare === 'function') {
      return navigator.canShare({ files: [file] });
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Triggers a standard file download via anchor element.
 * Works natively on Android DownloadManager and desktop browsers.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Allows the user to choose where to save or share the file using the device's native file picker/share system.
 * If Web Share API with files is supported (native Android share sheet), invokes it.
 * Otherwise, triggers direct browser download / save to files.
 */
export async function shareOrSaveFile(
  blob: Blob,
  filename: string,
  title?: string
): Promise<'shared' | 'downloaded'> {
  // Create standard File object
  const file = new File([blob], filename, {
    type: blob.type || 'application/octet-stream',
    lastModified: Date.now(),
  });

  // Attempt Web Share API (native Android Share sheet - offers Save to Drive, Files, etc.)
  if (canShareFiles(file)) {
    try {
      await navigator.share({
        title: title || filename,
        text: `Exported file: ${filename}`,
        files: [file],
      });
      return 'shared';
    } catch (err: unknown) {
      const error = err as { name?: string };
      // If user simply closed/cancelled the share dialog, do not force download
      if (error?.name === 'AbortError') {
        return 'shared';
      }
      // If sharing failed with error, fall through to download
      console.warn('Native share failed, falling back to download:', err);
    }
  }

  // Fallback to standard save/download
  triggerBrowserDownload(blob, filename);
  return 'downloaded';
}

/**
 * Formats a clean filename safe for device storage
 */
export function sanitizeFilename(name: string, fallback: string): string {
  const clean = name.replace(/[/\\?%*:|"<>]/g, '-').trim();
  return clean || fallback;
}

/**
 * Exports a note as a formatted plain text (.txt) file
 */
export async function exportNoteAsTxt(note: Note): Promise<'shared' | 'downloaded'> {
  const lines: string[] = [
    note.title,
    '='.repeat(Math.max(note.title.length, 20)),
    `Created: ${formatDateTime(note.created_at)}`,
    `Last Updated: ${formatDateTime(note.updated_at)}`,
    '',
    note.content || '(No content)',
    '',
    '----------------------------------------',
    'Exported from My Notes (DAT Technologies)',
  ];

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const safeTitle = sanitizeFilename(note.title, 'note');
  const filename = `${safeTitle}.txt`;

  return await shareOrSaveFile(blob, filename, note.title);
}

/**
 * Exports a note as a clean, professionally formatted PDF (.pdf) file
 */
export async function exportNoteAsPdf(note: Note): Promise<'shared' | 'downloaded'> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let y = margin + 20;

  // Header: App brand
  doc.setFontSize(10);
  doc.setTextColor(140, 140, 140);
  doc.text('MY NOTES', margin, y);
  doc.text(formatDateTime(note.updated_at), pageWidth - margin, y, { align: 'right' });

  y += 18;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);

  // Note Title
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);

  const titleLines = doc.splitTextToSize(note.title || 'Untitled Note', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 10;

  // Metadata: Created & Updated
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Created: ${formatDateTime(note.created_at)}   |   Updated: ${formatDateTime(note.updated_at)}`, margin, y);

  y += 15;
  doc.setDrawColor(235, 235, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 25;

  // Note Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  const bodyText = note.content || 'This note has no written content.';
  const paragraphs = bodyText.split('\n');

  for (const para of paragraphs) {
    if (para.trim() === '') {
      y += 14;
      continue;
    }

    const lines = doc.splitTextToSize(para, contentWidth);
    for (const line of lines) {
      if (y > pageHeight - margin - 30) {
        doc.addPage();
        y = margin + 20;
      }
      doc.text(line, margin, y);
      y += 16;
    }
    y += 6; // paragraph spacing
  }

  // Footer: Designed by DAT Technologies
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Designed by DAT Technologies', margin, pageHeight - margin + 15);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - margin + 15, { align: 'right' });
  }

  const pdfBlob = doc.output('blob');
  const safeTitle = sanitizeFilename(note.title, 'note');
  const filename = `${safeTitle}.pdf`;

  return await shareOrSaveFile(pdfBlob, filename, note.title);
}

/**
 * Exports all notes as a JSON backup file
 */
export function exportNotesAsJson(notes: Note[]): void {
  const dataStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `my-notes-backup-${dateStr}.json`;
  triggerBrowserDownload(blob, filename);
}

/**
 * Exports an imported file back to the phone / device in its exact original format
 */
export async function exportImportedFile(file: ImportedFile): Promise<'shared' | 'downloaded'> {
  if (!file.data) {
    throw new Error('File data is not available.');
  }

  return await shareOrSaveFile(file.data, file.name, file.name);
}
