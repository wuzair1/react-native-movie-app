import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface SavedMovie {
  id: number; title: string; poster_path: string | null;
  release_date: string; vote_average: number;
}
const KEY = "movie-library-v1";
const CONSENT_KEY = "movie-search-statistics-consent";
interface Library {
  saved: SavedMovie[]; nickname: string; analytics: boolean; ready: boolean; error: string | null;
  toggleMovie: (movie: SavedMovie) => void; setNickname: (value: string) => void;
  setAnalytics: (value: boolean) => void; clearSaved: () => void;
}
const LibraryContext = createContext<Library | null>(null);
export async function hasSearchConsent(): Promise<boolean> {
  try { return await AsyncStorage.getItem(CONSENT_KEY) === "true"; } catch { return false; }
}
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedMovie[]>([]);
  const [nickname, setName] = useState("Movie fan");
  const [analytics, setAnalytics] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.all([AsyncStorage.getItem(KEY), hasSearchConsent()]).then(([raw, consent]) => {
      if (!alive) return;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.saved)) setSaved(parsed.saved.filter((item: SavedMovie) => item && Number.isSafeInteger(item.id) && item.id > 0 && typeof item.title === "string").slice(0, 500));
        if (typeof parsed.nickname === "string") setName(parsed.nickname.slice(0, 40));
      }
      setAnalytics(consent);
    }).catch(() => { if (alive) setError("Could not read your saved data."); })
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ saved, nickname })).catch(() => setError("Could not save your changes on this device."));
  }, [saved, nickname, ready]);
  const toggleMovie = (movie: SavedMovie) => {
    if (!ready) return;
    setSaved(current => current.some(item => item.id === movie.id) ? current.filter(item => item.id !== movie.id) : [movie, ...current].slice(0, 500));
  };
  const changeAnalytics = (enabled: boolean) => {
    setAnalytics(enabled);
    AsyncStorage.setItem(CONSENT_KEY, String(enabled)).catch(() => { setAnalytics(false); setError("Could not save your privacy preference."); });
  };
  return <LibraryContext.Provider value={{ saved, nickname, analytics, ready, error, toggleMovie,
    setNickname: value => setName(value.trim().slice(0, 40) || "Movie fan"),
    setAnalytics: changeAnalytics, clearSaved: () => setSaved([]) }}>{children}</LibraryContext.Provider>;
}
export function useLibrary() {
  const value = useContext(LibraryContext);
  if (!value) throw new Error("LibraryProvider is missing.");
  return value;
}
