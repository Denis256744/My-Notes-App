export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  created_at: string;
  updated_at: string;
  data?: Blob;
}

export type ViewMode = 'dashboard' | 'all-notes' | 'files' | 'view' | 'create' | 'edit';

export type ThemeMode = 'light' | 'dark' | 'system';
