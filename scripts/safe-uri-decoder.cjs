"use strict";
// Preserve valid component decoding; malformed input stays raw instead of using
// the legacy dependency's recursive recovery algorithm.
module.exports = function safeDecodeUriComponent(input) {
  if (typeof input !== "string") throw new TypeError("Expected a string");
  const normalized = input.replace(/\+/g, " ");
  try { return decodeURIComponent(normalized); }
  catch { return normalized; }
};
