import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DemoProvider, useDemo } from '../demo';
jest.mock('@react-native-async-storage/async-storage', () => {
  const values: Record<string, string> = {};
  return { __esModule: true, default: {
    getItem: jest.fn(async (key: string) => values[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { values[key] = value; }),
    clear: jest.fn(async () => { Object.keys(values).forEach(key => delete values[key]); }),
  } };
});
describe('persisted entertainment demo', () => {
  let tree: ReactTestRenderer;
  let demo: ReturnType<typeof useDemo>;
  async function mount() {
    function Harness() { demo = useDemo(); return null; }
    await act(async () => { tree = create(<DemoProvider><Harness /></DemoProvider>); });
  }
  beforeEach(async () => { await AsyncStorage.clear(); });
  afterEach(async () => { await act(async () => tree.unmount()); });
  it('restores progress, claimed points and simulated withdrawals after restart', async () => {
    await mount();
    await act(async () => { demo.checkIn(); demo.checkIn(); demo.record(10378, 42); });
    expect(demo.points).toBe(100);
    await act(async () => { demo.withdraw(); });
    expect(demo.points).toBe(0);
    await act(async () => tree.unmount());
    await mount();
    expect(demo.state.progress[10378]).toBe(42);
    expect(demo.state.entries).toHaveLength(2);
    await act(async () => demo.checkIn());
    expect(demo.points).toBe(0);
  });
  it('awards each known sample once and rejects invalid progress or unknown titles', async () => {
    await mount();
    await act(async () => { demo.record(10378, 600, true); demo.record(10378, 600, true); demo.record(999, 30, true); demo.record(45745, NaN, true); });
    expect(demo.points).toBe(50);
    expect(demo.state.progress[10378]).toBe(0);
    expect(demo.state.entries).toHaveLength(1);
  });
});
