import { buildShortsSearchUrl, safeClipUrl } from "../shorts";
describe("free clip navigation", () => {
  it("encodes searches without allowing navigation injection", () => {
    const url = new URL(buildShortsSearchUrl("cats & trailers#test"));
    expect(url.hostname).toBe("www.youtube.com");
    expect(url.searchParams.get("search_query")).toBe("cats & trailers#test shorts");
  });
  it.each(["javascript:alert(1)", "intent://video", "https://youtube.com.evil.test/watch?v=x", "https://user@youtube.com/watch?v=x"])("blocks untrusted navigation %s", value => expect(safeClipUrl(value)).toBeUndefined());
  it("permits official HTTPS clip URLs", () => expect(safeClipUrl("https://www.youtube.com/shorts/abc")).toBeDefined());
});
