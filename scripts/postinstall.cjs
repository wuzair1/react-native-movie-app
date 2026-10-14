const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const adapter = spawnSync(process.execPath, [path.join(__dirname, "appwrite-filesystem-compat.cjs")], { stdio: "inherit" });
if (adapter.status !== 0) process.exit(adapter.status || 1);
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const replacement = fs.readFileSync(path.join(__dirname, "safe-uri-decoder.cjs"), "utf8");
let updated = 0;
for (const key of Object.keys(lock.packages || {})) {
  if (!/(?:^|\/)node_modules\/decode-uri-component$/.test(key)) continue;
  const directory = path.resolve(root, key);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
  if (manifest.version !== "0.2.2") continue;
  if (manifest.type === "module") throw new Error("Unexpected decoder module format; review the security adapter.");
  const file = path.resolve(directory, manifest.main || "index.js");
  if (!file.startsWith(directory + path.sep)) throw new Error("Unsafe decoder entry path");
  if (fs.readFileSync(file, "utf8") !== replacement) { fs.writeFileSync(file, replacement); updated++; }
}
console.log("Legacy malformed-URI recovery guard applied to decoder packages:", updated);
