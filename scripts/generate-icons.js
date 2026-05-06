#!/usr/bin/env node
// scripts/generate-icons.js
// Generates simple PNG icons for the PWA manifest using only Node.js built-ins

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(publicDir, { recursive: true });

// Build CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const combined = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(combined));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

/**
 * Creates a PNG with a solid background color and a simple car silhouette
 * @param {number} size - icon size in pixels
 * @param {number[]} bgColor - [r, g, b] background color
 * @param {number[]} fgColor - [r, g, b] foreground color
 */
function createIconPNG(size, bgColor, fgColor) {
  const [br, bg, bb] = bgColor;
  const [fr, fg, fb] = fgColor;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB color type
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // Build pixel data: filter byte + RGB per row
  const rawData = Buffer.alloc(size * (1 + size * 3));

  const s = size;
  // Rounded rectangle params (20% corner radius)
  const cornerR = Math.round(s * 0.18);
  const pad = Math.round(s * 0.0); // no outer padding (full icon)

  for (let y = 0; y < s; y++) {
    const rowStart = y * (1 + s * 3);
    rawData[rowStart] = 0; // no filter

    for (let x = 0; x < s; x++) {
      const px = rowStart + 1 + x * 3;

      // Rounded rect check (for rounded corners)
      // dx/dy measure distance outside the rounded-rectangle's inner box
      const dx = Math.max(pad + cornerR - x, 0, x - (s - pad - cornerR - 1));
      const dy = Math.max(pad + cornerR - y, 0, y - (s - pad - cornerR - 1));
      const inRoundedRect = dx * dx + dy * dy <= cornerR * cornerR &&
        x >= pad && x < s - pad && y >= pad && y < s - pad;
      const inRect = x >= pad + cornerR && x < s - pad - cornerR && y >= pad && y < s - pad;
      const inRectH = x >= pad && x < s - pad && y >= pad + cornerR && y < s - pad - cornerR;

      const inBackground = inRoundedRect || inRect || inRectH;

      if (!inBackground) {
        // Transparent (white) outside rounded rect
        rawData[px] = 255; rawData[px + 1] = 255; rawData[px + 2] = 255;
        continue;
      }

      // Draw car silhouette using normalized coordinates
      const nx = x / s;  // 0..1
      const ny = y / s;  // 0..1

      let isCar = false;

      // Car body (wide rectangle in lower half)
      if (nx >= 0.12 && nx <= 0.88 && ny >= 0.48 && ny <= 0.72) {
        isCar = true;
      }
      // Car roof (trapezoid, middle section upper)
      if (nx >= 0.28 && nx <= 0.72 && ny >= 0.28 && ny < 0.48) {
        // Simple rectangular roof area
        isCar = true;
      }
      // Left wheel
      const lwx = 0.28, lwy = 0.74;
      const lwr = 0.10;
      if ((nx - lwx) * (nx - lwx) + (ny - lwy) * (ny - lwy) <= lwr * lwr) {
        isCar = true;
      }
      // Right wheel
      const rwx = 0.72, rwy = 0.74;
      const rwr = 0.10;
      if ((nx - rwx) * (nx - rwx) + (ny - rwy) * (ny - rwy) <= rwr * rwr) {
        isCar = true;
      }

      if (isCar) {
        rawData[px] = fr; rawData[px + 1] = fg; rawData[px + 2] = fb;
      } else {
        rawData[px] = br; rawData[px + 1] = bg; rawData[px + 2] = bb;
      }
    }
  }

  const compressed = deflateSync(rawData);

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Primary: #2563eb = rgb(37, 99, 235), white fg
const bg = [37, 99, 235];
const fg = [255, 255, 255];

const icon192 = createIconPNG(192, bg, fg);
const icon512 = createIconPNG(512, bg, fg);

writeFileSync(join(publicDir, 'icon-192.png'), icon192);
writeFileSync(join(publicDir, 'icon-512.png'), icon512);

console.log('✓ Icons generated:');
console.log('  public/icons/icon-192.png');
console.log('  public/icons/icon-512.png');
