import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { balance, claim, DemoState, emptyDemo, withdrawDemo } from './demoRewards';
import { getFreeMovie } from '@/constants/freeMovies';
const KEY = 'entertainment-demo-v1';
const Context = createContext<null | { state: DemoState; points: number; ready: boolean; error: string; checkIn: () => void; withdraw: () => void; record: (id: number, seconds: number, ended?: boolean) => void }>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(emptyDemo);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (!alive || !raw) return;
      const data = JSON.parse(raw);
      if (!Array.isArray(data.entries) || !data.progress || typeof data.progress !== 'object') throw new Error();
      const entries = data.entries.filter((e: any) => e && typeof e.id === 'string' && typeof e.label === 'string' && Number.isSafeInteger(e.points));
      const progress: Record<string, number> = {};
      for (const [id, seconds] of Object.entries(data.progress)) if (getFreeMovie(id) && typeof seconds === 'number' && Number.isFinite(seconds) && seconds >= 0) progress[id] = seconds;
      setState({ entries, progress });
    }).catch(() => { if (alive) setError('Could not load demo history.'); }).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => setError('Could not save demo history.')); }, [state, ready]);
  return <Context.Provider value={{ state, points: balance(state), ready, error,
    checkIn: () => { if (ready) setState(s => claim(s, `daily:${new Date().toISOString().slice(0, 10)}`, 100, 'Daily demo check-in (UTC)')); },
    withdraw: () => { if (ready) setState(s => withdrawDemo(s, `withdraw:${Date.now()}`)); },
    record: (id, seconds, ended = false) => {
      if (!ready || !getFreeMovie(id) || !Number.isFinite(seconds) || seconds < 0) return;
      setState(s => {
        const next = { ...s, progress: { ...s.progress, [id]: ended ? 0 : seconds } };
        return ended ? claim(next, `episode:${id}`, 50, `Completed sample: ${getFreeMovie(id)!.title}`) : next;
      });
    }
  }}>{children}</Context.Provider>;
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error('DemoProvider is missing'); return value; }
