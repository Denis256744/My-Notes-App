import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-live="polite"
      id="pwa-offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 transition-colors"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>Offline Mode — Notes remain fully accessible and saved locally.</span>
    </aside>
  );
};
