export function normalizeReelUrl(input: string): string {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error("Paste a valid HTTPS Instagram Reel URL."); }
  if (url.protocol !== "https:" || !["instagram.com", "www.instagram.com"].includes(url.hostname) || url.port || url.username || url.password || !/^\/reel\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) throw new Error("Use https://www.instagram.com/reel/SHORTCODE/ for a single Reel.");
  return "https://www.instagram.com" + url.pathname.replace(/\/$/, "") + "/";
}

export function buildInstagramHtml(html: unknown, reelUrl: string): string {
  if (typeof html !== "string" || html.length > 200000) throw new Error("Invalid embed response.");
  const permalink = html.match(/data-instgrm-permalink\s*=\s*["']([^"']+)["']/i)?.[1];
  if (!permalink || normalizeReelUrl(permalink.replace(/&amp;/g, "&")) !== normalizeReelUrl(reelUrl)) throw new Error("The embed response does not match this Reel.");
  const safeUrl = normalizeReelUrl(reelUrl);
  // Reconstruct a minimal embed from the verified response; discard all untrusted scripts and markup.
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src https://www.instagram.com; frame-src https://www.instagram.com; style-src 'unsafe-inline'; img-src https: data:; connect-src https://www.instagram.com"><style>body{margin:0;background:#fff}blockquote{margin:0;width:100%}</style></head><body><blockquote class="instagram-media" data-instgrm-permalink="${safeUrl}" data-instgrm-version="14"><a href="${safeUrl}">View Reel on Instagram</a></blockquote><script async src="https://www.instagram.com/embed.js"></script></body></html>`;
}

export function isInstagramNavigation(raw: string): boolean {
  try { const url = new URL(raw); return url.protocol === "https:" && !url.username && !url.password && !url.port && ["www.instagram.com", "instagram.com"].includes(url.hostname); } catch { return false; }
}

export async function fetchInstagramEmbed(input: string, signal: AbortSignal, endpoint = process.env.EXPO_PUBLIC_INSTAGRAM_OEMBED_ENDPOINT): Promise<string> {
  const url = normalizeReelUrl(input);
  if (!endpoint || !/^https:\/\//.test(endpoint)) throw new Error("Instagram playback is not configured. Set the HTTPS oEmbed backend endpoint.");
  let response: Response;
  try { response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ url }), signal }); }
  catch (error) { if (signal.aborted) throw error; throw new Error("Network error. Check your connection and try again."); }
  if (!response.ok) {
    if (response.status === 429) throw new Error("Too many requests. Please try again later.");
    if ([404, 422].includes(response.status)) throw new Error("This Reel is unavailable or cannot be embedded.");
    throw new Error("The Instagram embed service could not process this Reel. Please try again later.");
  }
  try { return buildInstagramHtml((await response.json()).html, url); }
  catch { throw new Error("The service returned an invalid or mismatched embed."); }
}

