export interface FreeMovie {
  tmdbId: number;
  title: string;
  year: number;
  archiveId?: string;
  fileName?: string;
  attribution?: string;
  projectUrl?: string;
  licenseUrl?: string;
}

export const freeMovies: readonly FreeMovie[] = [
  {
    tmdbId: 10378,
    title: "Big Buck Bunny",
    year: 2008,
    archiveId: "BigBuckBunny1280x720Stereo",
    fileName: "big_buck_bunny_720_stereo.mp4",
    attribution: "© 2008 Blender Foundation / Peach Open Movie Team",
    projectUrl: "https://peach.blender.org/about/",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  {
    tmdbId: 45745,
    title: "Sintel",
    year: 2010,
    archiveId: "Sintel",
    fileName: "sintel-2048-stereo_512kb.mp4",
    attribution: "© Blender Foundation / durian.blender.org",
    projectUrl: "https://durian.blender.org/sharing/",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
];

export function getFreeMovie(id: string | number | undefined): FreeMovie | undefined {
  if (id === undefined || !/^\d+$/.test(String(id))) return;
  return freeMovies.find((movie) => movie.tmdbId === Number(id));
}
export function getArchivePageUrl(movie: FreeMovie): string {
  if (movie.archiveId) {
    return `https://archive.org/details/${encodeURIComponent(movie.archiveId)}`;
  }
  return `https://www.themoviedb.org/movie/${movie.tmdbId}`;
}

export function getStreamUrl(movie: FreeMovie): string {
  if (movie.archiveId && movie.fileName) {
    return `https://archive.org/download/${encodeURIComponent(movie.archiveId)}/${encodeURIComponent(movie.fileName)}`;
  }
  throw new Error("No verified free stream is available for this movie.");
}

