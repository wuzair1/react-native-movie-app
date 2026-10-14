import { freeMovies, getArchivePageUrl, getFreeMovie, getStreamUrl } from "../../constants/freeMovies";
import { buildPlayerHtml } from "../playback";

describe("free movie playback selection", () => {
  it("matches the verified TMDB IDs rather than a similarly named movie", () => {
    expect(getFreeMovie("10378")?.title).toBe("Big Buck Bunny");
    expect(getFreeMovie(45745)?.title).toBe("Sintel");
    expect(getFreeMovie(999999)).toBeUndefined();
  });

  it.each([undefined, "", "Sintel", "10378?url=https://example.com", "10378/../45745", "-10378"])(
    "does not accept an arbitrary playback identifier: %s",
    (id) => { expect(getFreeMovie(id)).toBeUndefined(); }
  );

  it("uses complete HTTPS MP4s from the selected Archive items", () => {
    for (const movie of freeMovies) {
      expect(new URL(getStreamUrl(movie)).hostname).toBe("archive.org");
      expect(getStreamUrl(movie)).toMatch(/^https:\/\/archive\.org\/download\/[^/]+\/[^/]+\.mp4$/);
      expect(getArchivePageUrl(movie)).toBe(`https://archive.org/details/${movie.archiveId}`);
      expect(movie.licenseUrl).toBe("https://creativecommons.org/licenses/by/3.0/");
    }
  });

  it("requires the viewer to start playback and reports media errors", () => {
    const html = buildPlayerHtml(freeMovies[0]);
    expect(html).toContain(getStreamUrl(freeMovies[0]));
    expect(html).toContain("controls playsinline");
    expect(html).not.toContain("autoplay");
    expect(html).toContain("addEventListener('error'");
    expect(html).toContain("video.pause()");
  });
});
