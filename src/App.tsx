/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Note, ViewMode, ImportedFile } from './types';
import {
  loadNotesFromStorage,
  loadPersistentNotes,
  persistNote,
  persistAllNotes,
  removePersistentNote,
  clearPersistentNotes,
  loadPersistentFiles,
  persistFile,
  removePersistentFile,
  clearPersistentFiles,
} from './utils/storage';
import { getFileExtension } from './utils/fileHelper';
import { exportImportedFile } from './utils/exportHelper';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AllNotesView } from './components/AllNotesView';
import { FilesView } from './components/FilesView';
import { NoteDetailView } from './components/NoteDetailView';
import { NoteForm } from './components/NoteForm';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { useTheme } from './hooks/useTheme';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotesFromStorage());
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<ViewMode>('dashboard');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [fileToDelete, setFileToDelete] = useState<ImportedFile | null>(null);
  const [previewFile, setPreviewFile] = useState<ImportedFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQueryForNotes, setSearchQueryForNotes] = useState<string>('');

  const universalFileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  // Handler to open search interface with an optional query
  const handleOpenSearch = (query?: string) => {
    setSearchQueryForNotes(query || '');
    navigateTo('all-notes');
  };

  // On startup: load notes and files from persistent IndexedDB
  useEffect(() => {
    let isMounted = true;

    // Load persistent notes
    loadPersistentNotes()
      .then((loadedNotes) => {
        if (isMounted && loadedNotes) {
          setNotes(loadedNotes);
        }
      })
      .catch((err) => {
        console.error('Failed to load notes from IndexedDB:', err);
      });

    // Load persistent imported files
    loadPersistentFiles()
      .then((loadedFiles) => {
        if (isMounted && loadedFiles) {
          setFiles(loadedFiles);
        }
      })
      .catch((err) => {
        console.error('Failed to load files from IndexedDB:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Toast auto-hide helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // View navigation helper
  const navigateTo = (view: ViewMode) => {
    if (view !== currentView) {
      setPreviousView(currentView);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open note to view full content
  const handleOpenNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setPreviousView(currentView === 'view' || currentView === 'edit' ? 'dashboard' : currentView);
    setCurrentView('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start editing note
  const handleStartEdit = (noteId: string) => {
    setActiveNoteId(noteId);
    setPreviousView('view');
    setCurrentView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Create new note: immediately writes to persistent IndexedDB
  const handleCreateNote = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      content,
      created_at: now,
      updated_at: now,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    persistNote(newNote, updatedNotes); // persists immediately to IndexedDB
    setActiveNoteId(newNote.id);
    setCurrentView('view');
    showToast('Note saved successfully!');
  };

  // Update existing note: immediately updates persistent IndexedDB
  const handleUpdateNote = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    if (!activeNoteId) return;
    const now = new Date().toISOString();

    let updatedTargetNote: Note | null = null;
    const updatedNotes = notes.map((note) => {
      if (note.id === activeNoteId) {
        updatedTargetNote = {
          ...note,
          title,
          content,
          updated_at: now,
        };
        return updatedTargetNote;
      }
      return note;
    });

    setNotes(updatedNotes);
    if (updatedTargetNote) {
      persistNote(updatedTargetNote, updatedNotes);
    } else {
      persistAllNotes(updatedNotes);
    }
    setCurrentView('view');
    showToast('Note updated successfully!');
  };

  // Delete note confirmation & execution
  const handleDeleteRequest = (note: Note) => {
    setNoteToDelete(note);
  };

  const handleConfirmDeleteNote = () => {
    if (!noteToDelete) return;
    const deleteId = noteToDelete.id;
    const updatedNotes = notes.filter((n) => n.id !== deleteId);
    setNotes(updatedNotes);
    removePersistentNote(deleteId, updatedNotes);
    setNoteToDelete(null);
    setActiveNoteId(null);
    setCurrentView(previousView === 'view' ? 'dashboard' : previousView);
    showToast('Note deleted successfully.');
  };

  // Import notes handler from settings: immediately updates persistent IndexedDB
  const handleImportNotes = (importedNotes: Note[]) => {
    // Merge without overwriting existing notes
    const existingIds = new Set(notes.map((n) => n.id));
    const newNotes = importedNotes.filter((n) => !existingIds.has(n.id));
    const merged = [...newNotes, ...notes];

    setNotes(merged);
    persistAllNotes(merged);
    setActiveNoteId(null);
    setCurrentView('dashboard');
    showToast(`Successfully imported ${newNotes.length} note${newNotes.length === 1 ? '' : 's'}!`);
  };

  // Clear all notes handler from settings
  const handleClearAllNotes = () => {
    setNotes([]);
    clearPersistentNotes();
    setActiveNoteId(null);
    setCurrentView('dashboard');
    showToast('All notes cleared from storage.');
  };

  /* =========================================================================
     UNIVERSAL DEVICE FILE IMPORT & EXPORT
     ========================================================================= */

  // Trigger universal device file picker (works seamlessly on Android & desktop)
  const triggerUniversalFilePicker = () => {
    if (universalFileInputRef.current) {
      universalFileInputRef.current.value = '';
      universalFileInputRef.current.click();
    }
  };

  // Process files selected from Android device picker / SAF / desktop file dialog
  const handleProcessImportedFiles = async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    if (fileArray.length === 0) return;

    const newlyImportedFiles: ImportedFile[] = [];

    for (const file of fileArray) {
      const now = new Date().toISOString();
      const ext = getFileExtension(file.name);

      // Create Blob from file data preserving bit-for-bit exact binary content
      const fileBlob = new Blob([file], { type: file.type || 'application/octet-stream' });

      const importedItem: ImportedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        extension: ext,
        created_at: now,
        updated_at: now,
        data: fileBlob,
      };

      // Persist directly to IndexedDB
      await persistFile(importedItem);
      newlyImportedFiles.push(importedItem);
    }

    setFiles((prev) => [...newlyImportedFiles, ...prev]);
    showToast(`Imported ${newlyImportedFiles.length} file${newlyImportedFiles.length === 1 ? '' : 's'} successfully!`);
  };

  // Export an imported file back to phone / device
  const handleExportFile = async (file: ImportedFile) => {
    try {
      const result = await exportImportedFile(file);
      if (result === 'shared') {
        showToast(`Shared "${file.name}"`);
      } else {
        showToast(`Exported "${file.name}" to device`);
      }
    } catch (err) {
      console.error('Failed to export file:', err);
      showToast('Failed to export file');
    }
  };

  // Delete file confirmation & execution
  const handleDeleteFileRequest = (file: ImportedFile) => {
    setFileToDelete(file);
  };

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const targetId = fileToDelete.id;
    await removePersistentFile(targetId);
    setFiles((prev) => prev.filter((f) => f.id !== targetId));
    if (previewFile?.id === targetId) {
      setPreviewFile(null);
    }
    setFileToDelete(null);
    showToast(`File "${fileToDelete.name}" deleted.`);
  };

  // Clear all files
  const handleClearAllFiles = async () => {
    await clearPersistentFiles();
    setFiles([]);
    setPreviewFile(null);
    showToast('All imported files cleared from storage.');
  };

  // Convert a text file to an editable note
  const handleConvertFileToNote = async (file: ImportedFile) => {
    if (!file.data) return;
    try {
      const text = await file.data.text();
      const rawName = file.name.replace(/\.[^/.]+$/, ''); // remove extension
      const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const now = new Date().toISOString();

      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        content: text,
        created_at: now,
        updated_at: now,
      };

      const updated = [newNote, ...notes];
      setNotes(updated);
      await persistNote(newNote, updated);
      setActiveNoteId(newNote.id);
      setPreviewFile(null);
      setCurrentView('view');
      showToast(`Created note from "${file.name}"!`);
    } catch (err) {
      console.error('Failed to convert file to note:', err);
      showToast('Could not convert this file to a note.');
    }
  };

  // Active note lookup
  const currentNote = activeNoteId ? notes.find((n) => n.id === activeNoteId) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-amber-100 dark:selection:bg-amber-900 selection:text-slate-900 dark:selection:text-amber-100">
      {/* Universal Hidden Device File Picker */}
      <input
        ref={universalFileInputRef}
        type="file"
        multiple
        accept="*/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessImportedFiles(e.target.files);
          }
        }}
      />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'create') {
            setActiveNoteId(null);
          }
          navigateTo(view);
        }}
        totalNotes={notes.length}
        totalFiles={files.length}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            id="app-toast-notification"
            role="status"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-lg border border-slate-700 dark:border-slate-600 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* View Router */}
        {currentView === 'dashboard' && (
          <DashboardView
            notes={notes}
            files={files}
            onOpenNote={handleOpenNote}
            onNavigate={(view) => {
              if (view === 'all-notes') {
                setSearchQueryForNotes('');
              }
              navigateTo(view);
            }}
            onTriggerImport={triggerUniversalFilePicker}
            onPreviewFile={(f) => setPreviewFile(f)}
            onExportFile={handleExportFile}
            onDeleteFileRequest={handleDeleteFileRequest}
            onConvertToNote={handleConvertFileToNote}
            onOpenSearch={handleOpenSearch}
          />
        )}

        {currentView === 'all-notes' && (
          <AllNotesView
            notes={notes}
            onOpenNote={handleOpenNote}
            onNavigate={(view) => navigateTo(view)}
            initialSearchQuery={searchQueryForNotes}
          />
        )}

        {currentView === 'files' && (
          <FilesView
            files={files}
            onTriggerImport={triggerUniversalFilePicker}
            onPreviewFile={(f) => setPreviewFile(f)}
            onExportFile={handleExportFile}
            onDeleteRequest={handleDeleteFileRequest}
            onConvertToNote={handleConvertFileToNote}
          />
        )}

        {currentView === 'view' && currentNote && (
          <NoteDetailView
            note={currentNote}
            onBack={() => navigateTo(previousView === 'view' ? 'dashboard' : previousView)}
            onEdit={handleStartEdit}
            onDeleteRequest={handleDeleteRequest}
            onShowToast={showToast}
          />
        )}

        {currentView === 'view' && !currentNote && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 transition-colors">
            <h2 className="font-display font-semibold text-xl text-slate-800 dark:text-slate-100 mb-2">
              Note Not Found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              This note may have been deleted or the link is invalid.
            </p>
            <button
              id="not-found-back-btn"
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold rounded-xl text-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {currentView === 'create' && (
          <NoteForm
            initialNote={null}
            onSave={handleCreateNote}
            onCancel={() => navigateTo(previousView)}
          />
        )}

        {currentView === 'edit' && (
          <NoteForm
            initialNote={currentNote}
            onSave={handleUpdateNote}
            onCancel={() => navigateTo('view')}
          />
        )}
      </main>

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        notes={notes}
        files={files}
        onImportNotes={handleImportNotes}
        onImportFiles={handleProcessImportedFiles}
        onClearAllNotes={handleClearAllNotes}
        onClearAllFiles={handleClearAllFiles}
        onShowToast={showToast}
      />

      {/* Delete Confirmation Modal for Notes */}
      <DeleteConfirmModal
        isOpen={Boolean(noteToDelete)}
        note={noteToDelete}
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setNoteToDelete(null)}
      />

      {/* Delete Confirmation Modal for Files */}
      <DeleteConfirmModal
        isOpen={Boolean(fileToDelete)}
        file={fileToDelete}
        onConfirm={handleConfirmDeleteFile}
        onCancel={() => setFileToDelete(null)}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        onExport={handleExportFile}
        onConvertToNote={handleConvertFileToNote}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* 1-Tap Mobile Phone Install Banner */}
      <InstallPromptBanner />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs py-6 px-4 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-display font-semibold text-slate-800 dark:text-slate-200">My Notes</span>
            <span>—</span>
            <span>Simple personal notes & files organizer</span>
          </div>

          <div className="text-center sm:text-right">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Designed by DAT Technologies
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
