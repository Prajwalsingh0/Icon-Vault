import assert from "node:assert/strict";
import test from "node:test";
import { crc32, zipStore } from "../src/lib/zip.js";

test("crc32 matches the PNG check value", () => {
  const bytes = new TextEncoder().encode("123456789");
  assert.equal(crc32(bytes), 0xcbf43926);
});

test("zipStore writes uncompressed entries that round-trip", () => {
  const zip = zipStore(
    [
      { name: "pack/a.svg", text: "<svg>a</svg>" },
      { name: "pack/manifest.json", text: "{\"count\":1}" },
    ],
    new Date(2026, 10, 10, 12, 0, 0),
  );
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  const files = readStore(zip);
  assert.deepEqual(
    files.map((file) => file.name),
    ["pack/a.svg", "pack/manifest.json"],
  );
  assert.equal(new TextDecoder().decode(files[0].data), "<svg>a</svg>");
  assert.equal(new TextDecoder().decode(files[1].data), "{\"count\":1}");
});

function readStore(zip) {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const files = [];
  let offset = 0;
  while (offset + 4 <= zip.length && view.getUint32(offset, true) === 0x04034b50) {
    const compressed = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    files.push({
      name: new TextDecoder().decode(zip.slice(nameStart, nameStart + nameLength)),
      data: zip.slice(dataStart, dataStart + compressed),
    });
    offset = dataStart + compressed;
  }
  assert.equal(view.getUint32(offset, true), 0x02014b50);
  return files;
}
