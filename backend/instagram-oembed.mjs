import { createServer } from "node:http";

const version = process.env.META_GRAPH_VERSION;
if (!/^v\d+\.0$/.test(version || "")) throw new Error("Set META_GRAPH_VERSION to a version verified against official Meta documentation.");
const token = process.env.META_OEMBED_ACCESS_TOKEN;
const port = Number(process.env.PORT || 8787);
function reply(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}
export function normalize(input) {
  if (typeof input !== "string") throw new Error("Invalid URL");
  const url = new URL(input.trim());
  if (url.protocol !== "https:" || !["www.instagram.com", "instagram.com"].includes(url.hostname) || url.port || url.username || url.password || !/^\/reel\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) throw new Error("Invalid URL");
  return "https://www.instagram.com" + url.pathname.replace(/\/$/, "") + "/";
}
createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/instagram/oembed") return reply(res, 404, { error: "Not found" });
  let body = "";
  try {
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body) > 4096) return reply(res, 413, { error: "Request too large" });
    }
    let url;
    try { url = normalize(JSON.parse(body).url); } catch { return reply(res, 400, { error: "Invalid Reel URL" }); }
    const endpoint = new URL("https://graph.facebook.com/" + version + "/instagram_oembed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("omitscript", "true");
    // Optional server credential only. Never return or log it.
    if (token) endpoint.searchParams.set("access_token", token);
    const upstream = await fetch(endpoint, { signal: AbortSignal.timeout(12000), redirect: "error" });
    if (!upstream.ok) {
      let code;
      try { code = (await upstream.json()).error?.code; } catch {}
      const status = upstream.status === 429 || [4, 17, 32, 613].includes(code) ? 429
        : [190, 10, 200].includes(code) || [401, 403].includes(upstream.status) ? 503
        : [400, 404].includes(upstream.status) ? 422 : 502;
      return reply(res, status, { error: "Meta could not embed this Reel" });
    }
    const text = await upstream.text();
    if (text.length > 200000) return reply(res, 502, { error: "Invalid Meta response" });
    const data = JSON.parse(text);
    if (typeof data.html !== "string") return reply(res, 502, { error: "Missing embed" });
    return reply(res, 200, { html: data.html });
  } catch {
    return reply(res, 502, { error: "Embed service unavailable" });
  }
}).listen(port, "127.0.0.1", () => console.log("oEmbed backend listening on port", port));


