#!/usr/bin/env node
// Build dist/operations.zip — the sideloadable app (the same files Pages serves).
// Uses the system `zip` if available; otherwise falls back to a pure-Node zip.
// Usage: node scripts/package.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
fs.mkdirSync(DIST, { recursive: true });

const FILES = ["index.html", "quizbank.js", "sw.js", "manifest.json", "icon-192.png", "icon-512.png", "docs/HOW TO INSTALL.txt", "README.md"];
const present = FILES.filter((f) => fs.existsSync(path.join(ROOT, f)));
const out = path.join(DIST, "operations.zip");
if (fs.existsSync(out)) fs.unlinkSync(out);

try {
  // system zip (quote filenames with spaces)
  const list = present.map((f) => `"${f}"`).join(" ");
  execSync(`zip -j "${out}" ${list}`, { cwd: ROOT, stdio: "ignore" });
  console.log("packaged (system zip):", out);
} catch (e) {
  // fallback: minimal store-only zip writer (no compression) in pure Node
  const crc32 = (buf) => { let c = ~0; for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return ~c >>> 0; };
  const chunks = []; const central = []; let offset = 0;
  for (const f of present) {
    const data = fs.readFileSync(path.join(ROOT, f));
    const name = Buffer.from(f);
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(0, 8);
    lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    chunks.push(lh, name, data);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0, 8); ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, name);
    offset += lh.length + name.length + data.length;
  }
  const cdStart = offset; const cd = Buffer.concat(central); const cdLen = cd.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(present.length, 8); end.writeUInt16LE(present.length, 10);
  end.writeUInt32LE(cdLen, 12); end.writeUInt32LE(cdStart, 16);
  fs.writeFileSync(out, Buffer.concat([...chunks, cd, end]));
  console.log("packaged (node fallback):", out);
}
