const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const escapedRoot = __dirname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Native build socket files and generated outputs are not JavaScript sources.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : config.resolver.blockList ? [config.resolver.blockList] : []),
  ...["\\.expo[\\\\/]build-tmp", "\\.expo[\\\\/]gradle-transforms", "\\.task-backups", "\\.credentials", "android", "dist"].map(folder =>
    new RegExp("^" + escapedRoot + "[\\\\/]" + folder + "(?:[\\\\/].*)?$")),
  // Native dependencies create and remove temporary CMake directories while
  // compiling. Watching them can crash Metro and they contain no JS sources.
  new RegExp("[\\\\/]node_modules[\\\\/].+[\\\\/]android[\\\\/](?:build|\\.cxx)(?:[\\\\/].*)?$"),
];

module.exports = withNativeWind(config, { input: "./app/globals.css" });
