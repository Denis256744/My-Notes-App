import { Note } from '../types';

// The app starts with 0 notes for a new user
export const INITIAL_NOTES: Note[] = [];

// Pre-populated demo/sample note identifiers to safely clean up from storage
export const DEMO_SAMPLE_NOTE_IDS = new Set([
  'note-1',
  'note-2',
  'note-3',
  'note-4',
  'note-5',
]);

export const DEMO_SAMPLE_TITLES = new Set([
  'Biology Exam Preparation & Review Topics',
  'Weekly Grocery & Meal Planning',
  'Sprint Planning: Q3 Roadmap Milestones',
  'Smart Plant Watering Device Concept',
  'Apartment Maintenance & Emergency Contacts',
]);

/**
 * Checks if a given note is one of the original pre-populated sample notes
 */
export function isSampleDemoNote(note: Note): boolean {
  if (!note) return false;
  return DEMO_SAMPLE_NOTE_IDS.has(note.id) || DEMO_SAMPLE_TITLES.has(note.title);
}

