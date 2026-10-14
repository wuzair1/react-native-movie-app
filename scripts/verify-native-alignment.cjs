// Verify ELF load-segment alignment in the APK's 64-bit native libraries.
const fs = require('node:fs');
const zlib = require('node:zlib');
const file = process.argv[2];
if (!file) throw new Error('Usage: node scripts/verify-native-alignment.cjs <apk>');
const zip = fs.readFileSync(file);
let end = zip.length - 22;
while (end >= Math.max(0, zip.length - 65557) && zip.readUInt32LE(end) !== 0x06054b50) end--;
if (end < 0 || zip.readUInt32LE(end) !== 0x06054b50) throw new Error('ZIP directory missing');
let cursor = zip.readUInt32LE(end + 16);
const count = zip.readUInt16LE(end + 10);
let checked = 0;
for (let entry = 0; entry < count; entry++) {
  if (zip.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Invalid ZIP directory');
  const nameSize = zip.readUInt16LE(cursor + 28);
  const name = zip.toString('utf8', cursor + 46, cursor + 46 + nameSize);
  if (/^lib\/(arm64-v8a|x86_64)\/.*\.so$/.test(name)) {
    const method = zip.readUInt16LE(cursor + 10);
    const size = zip.readUInt32LE(cursor + 20);
    const local = zip.readUInt32LE(cursor + 42);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const packed = zip.subarray(start, start + size);
    const elf = method === 0 ? packed : method === 8 ? zlib.inflateRawSync(packed) : null;
    if (!elf || elf.toString('hex', 0, 4) !== '7f454c46' || elf[4] !== 2 || elf[5] !== 1) throw new Error(`Unsupported ELF: ${name}`);
    const offset = Number(elf.readBigUInt64LE(32));
    const stride = elf.readUInt16LE(54);
    const segments = elf.readUInt16LE(56);
    let loads = 0;
    for (let i = 0; i < segments; i++) {
      const header = offset + i * stride;
      if (elf.readUInt32LE(header) !== 1) continue;
      loads++;
      const alignment = elf.readBigUInt64LE(header + 48);
      const fileOffset = elf.readBigUInt64LE(header + 8);
      const address = elf.readBigUInt64LE(header + 16);
      if (alignment < 16384n || fileOffset % 16384n !== address % 16384n) throw new Error(`16 KB ELF alignment failed: ${name}`);
    }
    if (!loads) throw new Error(`ELF has no load segments: ${name}`);
    checked++;
  }
  cursor += 46 + nameSize + zip.readUInt16LE(cursor + 30) + zip.readUInt16LE(cursor + 32);
}
if (!checked) throw new Error('No 64-bit native libraries found');
console.log(`16 KB ELF alignment passed for ${checked} native libraries. Run zipalign separately for APK ZIP alignment.`);
