export async function fetchJson(url: string, headers: Record<string, string>, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort);
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error("Movie data access is unavailable. Please contact the app provider.");
      if (response.status === 429) throw new Error("Too many requests. Please try again later.");
      throw new Error("Movie data is temporarily unavailable. Please try again.");
    }
    try { return await response.json(); } catch { throw new Error("The movie service returned an invalid response."); }
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The request timed out or was cancelled. Please try again.");
    if (error instanceof TypeError) throw new Error("Network error. Check your connection and try again.");
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}
