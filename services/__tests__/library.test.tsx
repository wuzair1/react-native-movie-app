import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasSearchConsent, LibraryProvider, useLibrary } from "../library";

jest.mock("@react-native-async-storage/async-storage", () => {
  const values: Record<string, string> = {};
  return { __esModule: true, default: {
    getItem: jest.fn(async (key: string) => values[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { values[key] = value; }),
    clear: jest.fn(async () => { Object.keys(values).forEach(key => delete values[key]); }),
  } };
});
describe("device-local library", () => {
  let tree: ReactTestRenderer | undefined;
  let state: ReturnType<typeof useLibrary>;
  const movie = { id: 10378, title: "Big Buck Bunny", poster_path: null, release_date: "2008", vote_average: 0 };
  async function mount() {
    function Harness() { state = useLibrary(); return null; }
    await act(async () => { tree = create(<LibraryProvider><Harness /></LibraryProvider>); });
  }
  beforeEach(async () => { await AsyncStorage.clear(); });
  afterEach(async () => { await act(async () => { tree?.unmount(); }); tree = undefined; });
  it("persists a saved movie and avoids duplicate entries", async () => {
    await mount();
    await act(async () => { state.toggleMovie(movie); });
    expect(state.saved).toHaveLength(1);
    await act(async () => { tree?.unmount(); });
    await mount();
    expect(state.saved[0].id).toBe(10378);
    await act(async () => { state.toggleMovie(movie); });
    expect(state.saved).toHaveLength(0);
  });
  it("keeps search sharing off until explicitly enabled", async () => {
    await mount();
    expect(state.analytics).toBe(false);
    expect(await hasSearchConsent()).toBe(false);
    await act(async () => { state.setAnalytics(true); });
    expect(await hasSearchConsent()).toBe(true);
    await act(async () => { state.setAnalytics(false); });
    expect(await hasSearchConsent()).toBe(false);
  });
  it("saves a trimmed display name and supports clearing the library", async () => {
    await mount();
    await act(async () => { state.setNickname("  Alex  "); state.toggleMovie(movie); });
    expect(state.nickname).toBe("Alex");
    await act(async () => { state.clearSaved(); });
    expect(state.saved).toEqual([]);
  });
});
