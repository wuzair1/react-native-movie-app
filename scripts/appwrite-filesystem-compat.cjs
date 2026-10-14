const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../node_modules/react-native-appwrite");
if (!fs.existsSync(root)) throw new Error("Appwrite SDK is missing.");
let updated = 0;
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (/\.(?:cjs|mjs|js|ts)$/.test(file)) {
      const source = fs.readFileSync(file, "utf8");
      const fixed = source.replace(/(["'])expo-file-system\1/g, (_, quote) => quote + "expo-file-system/legacy" + quote);
      if (fixed !== source) { fs.writeFileSync(file, fixed); updated++; }
    }
  }
}
for (const folder of ["src", "dist", "lib"]) {
  const directory = path.join(root, folder);
  if (fs.existsSync(directory)) visit(directory);
}
console.log("Appwrite SDK uses the Expo SDK 54 legacy file-system adapter; updated files:", updated);
