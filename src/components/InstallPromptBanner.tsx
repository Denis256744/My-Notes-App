import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const InstallPromptBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('notes_pwa_banner_dismissed') === 'true';
  });
  const [showGuide, setShowGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside installed standalone PWA or dismissed, do not show
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('notes_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setJustInstalled(true);
        setTimeout(() => {
          setIsDismissed(true);
        }, 2000);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {/* Floating Bottom Install Prompt */}
      <aside
        id="mobile-install-banner"
        aria-label="Install app prompt"
        className="fixed bottom-14 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto"
      >
        <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-700/60 dark:border-slate-600/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 overflow-hidden">
              <img
                src="/pwa-192x192.png"
                alt="My Notes"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Smartphone className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-white truncate">Install My Notes</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                Directly install to your phone's home screen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="install-banner-action-btn"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {justInstalled ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Installed</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Install</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="install-banner-dismiss-btn"
              onClick={handleDismiss}
              title="Dismiss for now"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Manual Install Instruction Modal for iOS or browsers without native prompt */}
      {showGuide && (
        <div
          id="install-guide-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowGuide(false)}
        >
          <div
            id="install-guide-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative text-left"
          >
            <button
              type="button"
              id="install-guide-close-btn"
              onClick={() => setShowGuide(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3
              id="install-guide-title"
              className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight"
            >
              Install on Your Phone
            </h3>

            {isIOS ? (
              <div className="mt-3 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>Follow these quick steps in Safari on your iPhone/iPad:</p>
                <ol className="space-y-2 text-slate-800 dark:text-slate-200">
                  <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button <Share2 className="inline w-3.5 h-3.5 mx-1 text-blue-500" />
                    </span>
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <span>
                      Select <strong>Add to Home Screen</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <span>
                      Tap <strong>Add</strong> in the top right
                    </span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="mt-3 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>To install directly in Google Chrome on Android:</p>
                <ol className="space-y-2 text-slate-800 dark:text-slate-200">
                  <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <span>
                      Tap the <strong>three dots menu (⋮)</strong> in Chrome
                    </span>
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <span>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <span>
                      Tap <strong>Install</strong> to add it to your apps list
                    </span>
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Got it</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
