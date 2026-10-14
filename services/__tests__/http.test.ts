import { fetchJson } from "../http";
describe("movie network boundary", () => {
  const original = global.fetch;
  afterEach(() => { global.fetch = original; jest.useRealTimers(); });
  it("reports API rate limits without returning raw provider errors", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    await expect(fetchJson("https://api.test/movie", {})).rejects.toThrow("Too many requests");
  });
  it("rejects malformed JSON safely", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError("Bad JSON"); } });
    await expect(fetchJson("https://api.test/movie", {})).rejects.toThrow("invalid response");
  });
  it("aborts stalled requests at the configured deadline", async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockImplementation((_, options) => new Promise((_, reject) => options.signal.addEventListener("abort", () => reject(new Error("Aborted")))));
    const request = fetchJson("https://api.test/movie", {});
    const assertion = expect(request).rejects.toThrow("timed out");
    jest.advanceTimersByTime(15000);
    await assertion;
  });
});
