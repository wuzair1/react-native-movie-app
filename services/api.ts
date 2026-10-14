import { fetchJson } from "./http";
export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: { accept: "application/json", Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}` },
};
export const fetchMovies = async ({ query }: { query: string }): Promise<Movie[]> => {
  if (!TMDB_CONFIG.API_KEY) throw new Error("Movie discovery is unavailable. You can still watch the free films on Home.");
  const endpoint = query.trim()
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?include_adult=false&query=${encodeURIComponent(query.trim().slice(0, 200))}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?include_adult=false&sort_by=popularity.desc`;
  const data = await fetchJson(endpoint, TMDB_CONFIG.headers);
  if (!data || typeof data !== "object" || !("results" in data) || !Array.isArray(data.results)) throw new Error("Invalid movie data.");
  return data.results.filter((movie: Movie) => movie && Number.isSafeInteger(movie.id) && typeof movie.title === "string" && !movie.adult);
};
export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
  if (!TMDB_CONFIG.API_KEY) throw new Error("Movie details are unavailable. You can still watch the free films on Home.");
  if (!/^\d+$/.test(movieId)) throw new Error("Invalid movie ID.");
  const data = await fetchJson(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}`, TMDB_CONFIG.headers);
  if (!data || typeof data !== "object" || !("id" in data) || data.id !== Number(movieId) || !("title" in data) || typeof data.title !== "string") throw new Error("Invalid movie details.");
  return data as MovieDetails;
};
