import React from 'react';
import { BookOpen, Plus, LayoutDashboard, FileText, Sun, Moon, Settings, FolderOpen } from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  totalNotes: number;
  totalFiles?: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  totalNotes,
  totalFiles = 0,
  isDark,
  onToggleTheme,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            id="nav-brand-button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100 rounded-lg p-1"
            title="Go to Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight block leading-tight">
                My Notes
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide block leading-tight">
                Personal Notebook & Storage
              </span>
            </div>
          </button>

          {/* Nav Items */}
          <nav className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              id="nav-link-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-link-all-notes"
              onClick={() => onNavigate('all-notes')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'all-notes'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Notes</span>
              <span className="ml-0.5 px-1.5 py-0.5 text-xs rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {totalNotes}
              </span>
            </button>

            <button
              id="nav-link-files"
              onClick={() => onNavigate('files')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'files'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Files</span>
              <span className="ml-0.5 px-1.5 py-0.5 text-xs rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {totalFiles}
              </span>
            </button>
          </nav>
        </div>

        {/* Action buttons & Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Quick Toggle */}
          <button
            id="nav-theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Settings Menu Button */}
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100"
            title="Open Settings & Backup"
            aria-label="Open Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="nav-btn-new-note"
            onClick={() => onNavigate('create')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-amber-500 dark:hover:bg-amber-400 dark:active:bg-amber-600 text-white dark:text-slate-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all hover:shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 text-amber-300 dark:text-slate-950 stroke-[2.5]" />
            <span>+ New Note</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="sm:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50/50 dark:bg-slate-900/80">
        <button
          id="mobile-nav-dashboard"
          onClick={() => onNavigate('dashboard')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
            currentView === 'dashboard'
              ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          id="mobile-nav-all-notes"
          onClick={() => onNavigate('all-notes')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
            currentView === 'all-notes'
              ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notes ({totalNotes})</span>
        </button>
        <button
          id="mobile-nav-files"
          onClick={() => onNavigate('files')}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
            currentView === 'files'
              ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Files ({totalFiles})</span>
        </button>
      </div>
    </header>
  );
};
