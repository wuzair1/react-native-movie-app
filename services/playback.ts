import { FreeMovie, getStreamUrl } from "../constants/freeMovies";

// Only a URL from the curated catalog enters this HTML, never a route-supplied URL.
export function buildPlayerHtml(movie: FreeMovie, resumeSeconds = 0): string {
  const streamUrl = getStreamUrl(movie);
  const resume = Number.isFinite(resumeSeconds) && resumeSeconds > 0 ? resumeSeconds : 0;
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}video{width:100%;height:100%;object-fit:contain}</style>
</head><body>
<video id="movie" controls playsinline preload="metadata" controlsList="nodownload">
<source src="${streamUrl}" type="video/mp4"></video>
<script>
const video = document.getElementById('movie');
const send = (type) => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(type);
video.addEventListener('loadedmetadata', () => { if (Number.isFinite(video.duration)) video.currentTime = Math.min(${resume}, Math.max(0, video.duration - 1)); send('ready'); });
let last = -5;
video.addEventListener('timeupdate', () => { if (Math.abs(video.currentTime - last) >= 5) { last = video.currentTime; send(JSON.stringify({ type: 'progress', seconds: video.currentTime })); } });
video.addEventListener('pause', () => send(JSON.stringify({ type: 'progress', seconds: video.currentTime })));
video.addEventListener('ended', () => send(JSON.stringify({ type: 'ended', seconds: video.currentTime })));
video.addEventListener('error', () => send('error'));
video.querySelector('source').addEventListener('error', () => send('error'));
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
</script></body></html>`;
}
