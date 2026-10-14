export interface ShortItem {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  channelTitle?: string;
}
export function buildShortsSearchUrl(query: string): string {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query.trim().slice(0, 120) + " shorts");
}
export function safeClipUrl(input: unknown): string | undefined {
  if (typeof input !== "string") return;
  try {
    const url = new URL(input);
    if (url.protocol === "https:" && !url.username && !url.password && !url.port &&
      ["www.youtube.com", "youtube.com", "youtu.be", "www.instagram.com", "instagram.com"].includes(url.hostname)) return url.toString();
  } catch {}
}
export async function fetchRealtimeShorts(query = "funny cat", signal?: AbortSignal): Promise<ShortItem[]> {
  const endpoint = process.env.EXPO_PUBLIC_SHORTS_ENDPOINT;
  if (!endpoint) return []; // Default free flow opens YouTube; no paid discovery API.
  const parsed = new URL(endpoint);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("The clips service is not configured correctly.");
  parsed.searchParams.set("query", query.trim().slice(0, 120));
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort);
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetch(parsed.toString(), { headers: { Accept: "application/json" }, signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 429 ? "Too many requests. Try again later." : "The clips service is unavailable.");
    const json = await response.json();
    const items: unknown = Array.isArray(json) ? json : json?.results ?? json?.items ?? json?.data;
    if (!Array.isArray(items)) throw new Error("Invalid clips response.");
    return items.slice(0, 50).flatMap((item: unknown, index) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const url = safeClipUrl(record.url);
      if (!url) return [];
      const thumbnail = typeof record.thumbnail === "string" && /^https:\/\//.test(record.thumbnail) ? record.thumbnail : undefined;
      return [{ id: typeof record.id === "string" ? record.id : String(index), url,
        title: typeof record.title === "string" ? record.title.slice(0, 300) : "Video clip",
        channelTitle: typeof record.channelTitle === "string" ? record.channelTitle.slice(0, 100) : undefined, thumbnail }];
    });
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The clips request timed out or was cancelled.");
    throw error instanceof Error ? error : new Error("Network error. Check your connection.");
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}
