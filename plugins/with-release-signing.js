const { withAppBuildGradle } = require("expo/config-plugins");
module.exports = config => withAppBuildGradle(config, config => {
  const begin = "// @generated upload-signing begin";
  const end = "// @generated upload-signing end";
  config.modResults.contents = config.modResults.contents.replace(new RegExp(begin + "[\\s\\S]*?" + end + "\\s*", "g"), "");
  config.modResults.contents += `
${begin}
def uploadStorePath = System.getenv("ANDROID_UPLOAD_STORE_FILE")
def uploadStorePassword = System.getenv("ANDROID_UPLOAD_STORE_PASSWORD")
def uploadKeyPassword = System.getenv("ANDROID_UPLOAD_KEY_PASSWORD")
def uploadKeyAlias = System.getenv("ANDROID_UPLOAD_KEY_ALIAS")
def uploadSigningReady = uploadStorePath && uploadStorePassword && uploadKeyPassword && uploadKeyAlias
if (uploadSigningReady) {
    android.signingConfigs.create("upload") {
        storeFile file(uploadStorePath)
        storePassword uploadStorePassword
        keyAlias uploadKeyAlias
        keyPassword uploadKeyPassword
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.upload
} else {
    android.buildTypes.release.signingConfig = null
    gradle.taskGraph.whenReady { graph ->
        if (graph.allTasks.any { it.project == project && (it.name == "bundleRelease" || it.name == "assembleRelease" || it.name == "packageReleaseBundle" || it.name == "packageRelease") }) {
            throw new GradleException("Release signing is missing. Run npm run build:android:local or configure the ANDROID_UPLOAD_* environment values.")
        }
    }
}
${end}
`;
  return config;
});
