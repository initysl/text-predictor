import { useEffect, useState } from 'react';
import { getStats } from '../lib/api';
import { Stats } from '../types';

export type StatsStatus = 'loading' | 'online' | 'offline';

export function useModelStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<StatsStatus>('loading');

  useEffect(() => {
    let active = true;
    getStats()
      .then((result) => {
        if (!active) return;
        setStats(result);
        setStatus('online');
      })
      .catch((error) => {
        console.error('Failed to load stats:', error);
        if (active) setStatus('offline');
      });
    return () => {
      active = false;
    };
  }, []);

  return { stats, status };
}
