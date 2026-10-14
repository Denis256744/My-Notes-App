import { Note, ImportedFile } from '../types';
import { isSampleDemoNote } from '../data/initialNotes';

const DB_NAME = 'MyNotesPersistentDB';
const DB_VERSION = 2; // Incremented to support persistent files storage
const NOTES_STORE_NAME = 'notes';
const FILES_STORE_NAME = 'files';

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Opens or initializes the IndexedDB database for persistent notes and files storage
 */
export function openNotesDB(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Notes store
        if (!db.objectStoreNames.contains(NOTES_STORE_NAME)) {
          const store = db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' });
          store.createIndex('updated_at', 'updated_at', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
        }

        // Files store (for persistent Android / device imported files)
        if (!db.objectStoreNames.contains(FILES_STORE_NAME)) {
          const fileStore = db.createObjectStore(FILES_STORE_NAME, { keyPath: 'id' });
          fileStore.createIndex('updated_at', 'updated_at', { unique: false });
          fileStore.createIndex('created_at', 'created_at', { unique: false });
          fileStore.createIndex('name', 'name', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('Failed to open IndexedDB:', (event.target as IDBOpenDBRequest).error);
        dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB connection blocked by another open tab.');
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

/* =========================================================================
   NOTES OPERATIONS
   ========================================================================= */

/**
 * Loads all notes from persistent IndexedDB storage
 */
export async function getAllNotesFromIndexedDB(): Promise<Note[]> {
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE_NAME, 'readonly');
      const store = transaction.objectStore(NOTES_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as Note[];
        if (Array.isArray(items)) {
          // Filter out any demo sample notes
          const validNotes = items.filter(
            (n) => n && typeof n.title === 'string' && !isSampleDemoNote(n)
          );
          // Sort by updated_at descending
          validNotes.sort((a, b) => {
            const timeA = new Date(a.updated_at).getTime() || 0;
            const timeB = new Date(b.updated_at).getTime() || 0;
            return timeB - timeA;
          });
          resolve(validNotes);
        } else {
          resolve([]);
        }
      };

      request.onerror = () => {
        console.error('Error fetching notes from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error reading from IndexedDB:', err);
    return [];
  }
}

/**
 * Saves or updates a single note in persistent IndexedDB storage
 */
export async function putNoteInIndexedDB(note: Note): Promise<void> {
  if (!note || isSampleDemoNote(note)) return;
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(NOTES_STORE_NAME);
      const request = store.put(note);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to put note in IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error writing note to IndexedDB:', err);
  }
}

/**
 * Saves all notes into persistent IndexedDB storage (replaces full store)
 */
export async function putAllNotesInIndexedDB(notes: Note[]): Promise<void> {
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(NOTES_STORE_NAME);
      store.clear();

      for (const note of notes) {
        if (!isSampleDemoNote(note)) {
          store.put(note);
        }
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        console.error('Transaction error in putAllNotesInIndexedDB:', transaction.error);
        reject(transaction.error);
      };
      transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  } catch (err) {
    console.error('Error replacing notes in IndexedDB:', err);
  }
}

/**
 * Deletes a note from persistent IndexedDB storage by its unique ID
 */
export async function deleteNoteFromIndexedDB(noteId: string): Promise<void> {
  if (!noteId) return;
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(NOTES_STORE_NAME);
      const request = store.delete(noteId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to delete note from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error deleting note from IndexedDB:', err);
  }
}

/**
 * Clears all notes from persistent IndexedDB storage
 */
export async function clearAllNotesFromIndexedDB(): Promise<void> {
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(NOTES_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to clear notes in IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error clearing notes from IndexedDB:', err);
  }
}

/* =========================================================================
   IMPORTED FILES OPERATIONS (Persistent binary & document storage)
   ========================================================================= */

/**
 * Loads all imported files from persistent IndexedDB storage
 */
export async function getAllFilesFromIndexedDB(): Promise<ImportedFile[]> {
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FILES_STORE_NAME, 'readonly');
      const store = transaction.objectStore(FILES_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result as ImportedFile[];
        if (Array.isArray(items)) {
          // Sort by updated_at descending
          items.sort((a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime() || 0;
            const timeB = new Date(b.updated_at || b.created_at).getTime() || 0;
            return timeB - timeA;
          });
          resolve(items);
        } else {
          resolve([]);
        }
      };

      request.onerror = () => {
        console.error('Error fetching files from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error reading files from IndexedDB:', err);
    return [];
  }
}

/**
 * Stores an imported file into persistent IndexedDB storage
 */
export async function putFileInIndexedDB(file: ImportedFile): Promise<void> {
  if (!file || !file.id) return;
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FILES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(FILES_STORE_NAME);
      const request = store.put(file);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to put file in IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error storing file in IndexedDB:', err);
  }
}

/**
 * Deletes an imported file from persistent IndexedDB storage
 */
export async function deleteFileFromIndexedDB(fileId: string): Promise<void> {
  if (!fileId) return;
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FILES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(FILES_STORE_NAME);
      const request = store.delete(fileId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to delete file from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error deleting file from IndexedDB:', err);
  }
}

/**
 * Clears all imported files from persistent IndexedDB storage
 */
export async function clearAllFilesFromIndexedDB(): Promise<void> {
  try {
    const db = await openNotesDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FILES_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(FILES_STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to clear files from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Error clearing files from IndexedDB:', err);
  }
}
