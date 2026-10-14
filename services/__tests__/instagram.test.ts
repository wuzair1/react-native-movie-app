import { buildInstagramHtml, isInstagramNavigation, normalizeReelUrl, fetchInstagramEmbed } from "../instagram";
describe("Instagram embed trust boundary", () => {
  it("canonicalizes a Reel and discards tracking", () => {
    expect(normalizeReelUrl(" https://instagram.com/reel/abc_123/?igsh=x ")).toBe("https://www.instagram.com/reel/abc_123/");
  });
  it.each(["http://instagram.com/reel/x/", "https://instagram.com.evil.test/reel/x/", "https://evil@instagram.com/reel/x/", "https://instagram.com/p/x/", "https://instagram.com/reels/", "javascript:alert(1)", "https://instagram.com:444/reel/x/"])("rejects %s", input => {
    expect(() => normalizeReelUrl(input)).toThrow();
  });
  it("discards malicious markup and verifies the returned permalink", () => {
    const html = buildInstagramHtml('<blockquote data-instgrm-permalink="https://www.instagram.com/reel/abc/?igsh=x" onclick="evil()"><script src="https://evil.test"></script>', "https://instagram.com/reel/abc/");
    expect(html).not.toContain("evil");
    expect(html).toContain("https://www.instagram.com/embed.js");
    expect(() => buildInstagramHtml('<blockquote data-instgrm-permalink="https://instagram.com/reel/other/">', "https://instagram.com/reel/abc/")).toThrow();
  });
  it("restricts embedded navigation", () => {
    expect(isInstagramNavigation("https://www.instagram.com/reel/abc/embed/")).toBe(true);
    expect(isInstagramNavigation("https://instagram.com.evil.test/")).toBe(false);
    expect(isInstagramNavigation("intent://instagram")).toBe(false);
  });
  it("reports rate limits without exposing upstream data", async () => {
    process.env.EXPO_PUBLIC_INSTAGRAM_OEMBED_ENDPOINT = "https://backend.test/instagram/oembed";
    const original = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    try { await expect(fetchInstagramEmbed("https://instagram.com/reel/abc/", new AbortController().signal, "https://backend.test/instagram/oembed")).rejects.toThrow("Too many"); }
    finally { global.fetch = original; delete process.env.EXPO_PUBLIC_INSTAGRAM_OEMBED_ENDPOINT; }
  });
});

