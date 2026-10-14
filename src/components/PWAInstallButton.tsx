import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      // If browser doesn't expose beforeinstallprompt directly (e.g. desktop Chrome menu or iOS or unsupported browser), show guidance
      setShowGuide(true);
    }
  };

  // If already running inside standalone PWA window
  if (isInstalled && variant === 'button') {
    return null;
  }

  return (
    <>
      {variant === 'card' ? (
        <button
          type="button"
          id="settings-install-app-card"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 text-left transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white block">
                {isInstalled ? 'App Installed on Device' : 'Install to Phone / Home Screen'}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                {isInstalled
                  ? 'Running as installed application with offline access'
                  : 'Fast 1-tap install on Android & iOS • Works offline'}
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 shrink-0 px-2.5 py-1 bg-amber-200/80 dark:bg-amber-900/60 rounded-xl">
            {isInstalled ? 'Installed' : 'Install'}
          </span>
        </button>
      ) : (
        <button
          id="pwa-install-button"
          onClick={handleInstallClick}
          title="Install My Notes to your device home screen"
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all hover:shadow-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
        >
          {justInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 stroke-[2.5]" />
              <span>Installed</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 stroke-[2.5]" />
              <span>Install App</span>
            </>
          )}
        </button>
      )}

      {/* Guidance Modal for browsers that require menu install or iOS */}
      {showGuide && (
        <div
          id="pwa-guide-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowGuide(false)}
        >
          <div
            id="pwa-guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative text-left transition-colors duration-200"
          >
            <button
              id="pwa-guide-close-btn"
              onClick={() => setShowGuide(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-100 dark:border-amber-900/50">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3
              id="pwa-guide-title"
              className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight"
            >
              Install My Notes
            </h3>

            {isIOS ? (
              <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>To install on iPhone or iPad:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-700 dark:text-slate-200">
                  <li>
                    Tap the <strong>Share</strong> button <Share2 className="inline w-3.5 h-3.5 mx-0.5 text-blue-600 dark:text-blue-400" /> at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top-right corner.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>To install on your Android device or computer:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-700 dark:text-slate-200">
                  <li>
                    Tap the browser menu <strong>(⋮ or ⋯)</strong> in Chrome, Edge, or Samsung Internet.
                  </li>
                  <li>
                    Select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
                  </li>
                  <li>
                    Follow the on-screen prompt to complete installation.
                  </li>
                </ol>
              </div>
            )}

            <button
              id="pwa-guide-done-btn"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold transition-colors shadow-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
