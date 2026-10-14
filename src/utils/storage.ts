import { Note, ImportedFile } from '../types';
import { isSampleDemoNote } from '../data/initialNotes';
import {
  getAllNotesFromIndexedDB,
  putNoteInIndexedDB,
  putAllNotesInIndexedDB,
  deleteNoteFromIndexedDB,
  clearAllNotesFromIndexedDB,
  getAllFilesFromIndexedDB,
  putFileInIndexedDB,
  deleteFileFromIndexedDB,
  clearAllFilesFromIndexedDB,
} from './idb';

const STORAGE_KEY = 'my_notes_app_data_v1';

/* =========================================================================
   NOTES STORAGE & PERSISTENCE
   ========================================================================= */

/**
 * Synchronously loads cached notes from localStorage for instant initial render
 */
export function loadNotesFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const userNotesOnly: Note[] = parsed.filter(
        (note) =>
          typeof note === 'object' &&
          note !== null &&
          typeof note.title === 'string' &&
          !isSampleDemoNote(note)
      );

      if (userNotesOnly.length !== parsed.length) {
        saveNotesToStorage(userNotesOnly);
      }

      return userNotesOnly;
    }
    return [];
  } catch (error) {
    console.error('Failed to load notes from localStorage:', error);
    return [];
  }
}

/**
 * Synchronously saves notes to localStorage as immediate cache and fallback
 */
export function saveNotesToStorage(notes: Note[]): void {
  try {
    const cleanNotes = notes.filter((n) => !isSampleDemoNote(n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanNotes));
  } catch (error) {
    console.error('Failed to save notes to localStorage:', error);
  }
}

/**
 * Loads notes from persistent IndexedDB.
 * If IndexedDB is empty but localStorage has existing notes, automatically migrates
 * them into IndexedDB so no user notes are ever lost.
 */
export async function loadPersistentNotes(): Promise<Note[]> {
  try {
    const idbNotes = await getAllNotesFromIndexedDB();
    if (idbNotes && idbNotes.length > 0) {
      // Sync cache in localStorage
      saveNotesToStorage(idbNotes);
      return idbNotes;
    }

    // Fallback & Migration check: do we have notes in localStorage from previous versions?
    const localNotes = loadNotesFromStorage();
    if (localNotes && localNotes.length > 0) {
      console.log('Migrating existing notes from localStorage to IndexedDB...', localNotes.length);
      await putAllNotesInIndexedDB(localNotes);
      return localNotes;
    }

    return [];
  } catch (error) {
    console.error('Error loading persistent notes from IndexedDB:', error);
    return loadNotesFromStorage();
  }
}

/**
 * Persists a single note immediately to IndexedDB and syncs the full list
 */
export async function persistNote(note: Note, allNotes: Note[]): Promise<void> {
  saveNotesToStorage(allNotes);
  try {
    await putNoteInIndexedDB(note);
  } catch (error) {
    console.error('Failed to persist note to IndexedDB:', error);
  }
}

/**
 * Persists all notes immediately to IndexedDB and syncs localStorage
 */
export async function persistAllNotes(notes: Note[]): Promise<void> {
  saveNotesToStorage(notes);
  try {
    await putAllNotesInIndexedDB(notes);
  } catch (error) {
    console.error('Failed to persist all notes to IndexedDB:', error);
  }
}

/**
 * Deletes a note immediately from persistent IndexedDB and syncs localStorage
 */
export async function removePersistentNote(noteId: string, updatedNotes: Note[]): Promise<void> {
  saveNotesToStorage(updatedNotes);
  try {
    await deleteNoteFromIndexedDB(noteId);
  } catch (error) {
    console.error('Failed to delete note from IndexedDB:', error);
  }
}

/**
 * Clears all persistent notes from IndexedDB and localStorage
 */
export async function clearPersistentNotes(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    await clearAllNotesFromIndexedDB();
  } catch (error) {
    console.error('Failed to clear persistent notes:', error);
  }
}

/* =========================================================================
   IMPORTED FILES STORAGE & PERSISTENCE
   ========================================================================= */

/**
 * Loads all persistent imported files from IndexedDB
 */
export async function loadPersistentFiles(): Promise<ImportedFile[]> {
  try {
    return await getAllFilesFromIndexedDB();
  } catch (error) {
    console.error('Failed to load persistent files from IndexedDB:', error);
    return [];
  }
}

/**
 * Persists an imported file directly into IndexedDB
 */
export async function persistFile(file: ImportedFile): Promise<void> {
  try {
    await putFileInIndexedDB(file);
  } catch (error) {
    console.error('Failed to persist file in IndexedDB:', error);
  }
}

/**
 * Removes an imported file permanently from IndexedDB
 */
export async function removePersistentFile(fileId: string): Promise<void> {
  try {
    await deleteFileFromIndexedDB(fileId);
  } catch (error) {
    console.error('Failed to delete file from IndexedDB:', error);
  }
}

/**
 * Clears all persistent files from IndexedDB
 */
export async function clearPersistentFiles(): Promise<void> {
  try {
    await clearAllFilesFromIndexedDB();
  } catch (error) {
    console.error('Failed to clear persistent files:', error);
  }
}

/* =========================================================================
   DATE FORMATTERS
   ========================================================================= */

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return 'Unknown date';
  }
}

export function formatRelativeDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Recently';
  }
}
