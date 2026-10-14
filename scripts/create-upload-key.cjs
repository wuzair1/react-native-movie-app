const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const directory = path.resolve(__dirname, "../.credentials");
const settings = path.join(directory, "signing.json");
const keystore = path.join(directory, "upload.keystore");
fs.mkdirSync(directory, { recursive: true });
if (fs.existsSync(settings) && fs.existsSync(keystore)) {
  console.log("Reusing the existing local upload key.");
  process.exit(0);
}
if (fs.existsSync(settings) || fs.existsSync(keystore)) throw new Error("Incomplete signing files. Recover the existing key/configuration; refusing to overwrite it.");
if (!process.env.JAVA_HOME) throw new Error("Set JAVA_HOME to your JDK before generating the upload key.");
const password = crypto.randomBytes(32).toString("base64url");
const configuration = { storeFile: keystore, storePassword: password, keyPassword: password, keyAlias: "upload" };
const result = spawnSync(path.join(process.env.JAVA_HOME, "bin", "keytool.exe"), [
  "-genkeypair", "-noprompt", "-keystore", keystore, "-storetype", "PKCS12",
  "-alias", configuration.keyAlias, "-keyalg", "RSA", "-keysize", "4096", "-validity", "10000",
  "-dname", "CN=Android Upload, OU=Mobile, O=App Publisher",
  "-storepass:env", "UPLOAD_KEY_PASSWORD", "-keypass:env", "UPLOAD_KEY_PASSWORD"
], { env: { ...process.env, UPLOAD_KEY_PASSWORD: password }, stdio: "inherit" });
if (result.status !== 0) throw new Error("Upload-key creation failed. Check keytool diagnostics.");
fs.writeFileSync(settings, JSON.stringify(configuration, null, 2), { mode: 0o600 });
console.log("Local upload key created. Back up .credentials privately; never publish or commit it.");
