const decode = require("decode-uri-component");
describe("legacy malformed URI recovery guard", () => {
  it("preserves valid Unicode, percent encoding and plus decoding", () => {
    expect(decode("film%20%F0%9F%8E%A5+%2F")).toBe("film 🎥 /");
  });
  it("returns malformed input safely after a single decoding attempt", () => {
    const spy = jest.spyOn(global, "decodeURIComponent").mockImplementation(() => { throw new URIError("Malformed"); });
    const input = "%E0%A4%A".repeat(500);
    try { expect(decode(input)).toBe(input); expect(spy).toHaveBeenCalledTimes(1); }
    finally { spy.mockRestore(); }
  });
  it("rejects non-string input", () => expect(() => decode(null)).toThrow(TypeError));
});

