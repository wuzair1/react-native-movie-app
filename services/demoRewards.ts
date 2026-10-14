export interface DemoEntry { id: string; points: number; label: string; }
export interface DemoState { entries: DemoEntry[]; progress: Record<string, number>; }
export const emptyDemo: DemoState = { entries: [], progress: {} };
export function balance(state: DemoState) { return state.entries.reduce((sum, entry) => sum + entry.points, 0); }
export function claim(state: DemoState, id: string, points: number, label: string): DemoState {
  if (state.entries.some(entry => entry.id === id) || !Number.isSafeInteger(points) || points <= 0) return state;
  return { ...state, entries: [...state.entries, { id, points, label }] };
}
export function withdrawDemo(state: DemoState, id: string): DemoState {
  if (balance(state) < 100 || state.entries.some(entry => entry.id === id)) return state;
  return { ...state, entries: [...state.entries, { id, points: -100, label: 'Simulated withdrawal — no payment sent' }] };
}
