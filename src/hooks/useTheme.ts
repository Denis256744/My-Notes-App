import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types';

const THEME_STORAGE_KEY = 'my_notes_theme_preference';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply theme to DOM and meta tag
  const applyTheme = useCallback((activeTheme: ThemeMode) => {
    const root = document.documentElement;
    let systemPrefersDark = false;
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      systemPrefersDark = false;
    }
    const effectiveDark = activeTheme === 'dark' || (activeTheme === 'system' && systemPrefersDark);

    setIsDark(effectiveDark);

    if (effectiveDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update theme-color meta tag for mobile browsers and PWA status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveDark ? '#0b1120' : '#0f172a');
    }
  }, []);

  // Update theme setting
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  // Quick toggle between light and dark
  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, setTheme]);

  // Initial mount and system listener
  useEffect(() => {
    applyTheme(theme);

    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = () => {
        if (theme === 'system') {
          applyTheme('system');
        }
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleSystemChange);
        return () => {
          mediaQuery.removeEventListener('change', handleSystemChange);
        };
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        // Fallback for older Safari and mobile WebViews
        (mediaQuery as any).addListener(handleSystemChange);
        return () => {
          (mediaQuery as any).removeListener(handleSystemChange);
        };
      }
    } catch (err) {
      console.warn('System dark mode listener not supported:', err);
    }
  }, [theme, applyTheme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
