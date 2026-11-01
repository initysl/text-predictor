import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage blocked; fall back to the system theme
  }
  return 'system';
}

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);

  useEffect(() => {
    const apply = () => {
      const dark = preference === 'dark' || (preference === 'system' && systemQuery().matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();

    try {
      if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Not persisted; the choice still applies for this visit
    }

    if (preference !== 'system') return;
    const query = systemQuery();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [preference]);

  const cycle = useCallback(
    () => setPreference((p) => ORDER[(ORDER.indexOf(p) + 1) % ORDER.length]),
    [],
  );

  return { preference, cycle };
}
