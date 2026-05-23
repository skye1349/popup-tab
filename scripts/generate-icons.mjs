import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const sizes = [16, 32, 48, 128];

mkdirSync("icons", { recursive: true });

for (const size of sizes) {
  writeFileSync(`icons/icon-${size}.png`, createIconPng(size));
}

function createIconPng(size) {
  const rows = [];

  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;

    for (let x = 0; x < size; x += 1) {
      const offset = 1 + x * 4;
      const color = getPixel(size, x, y);
      row[offset] = color[0];
      row[offset + 1] = color[1];
      row[offset + 2] = color[2];
      row[offset + 3] = color[3];
    }

    rows.push(row);
  }

  return Buffer.concat([
    pngSignature(),
    chunk("IHDR", ihdr(size, size)),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function getPixel(size, x, y) {
  const margin = Math.max(1, Math.round(size * 0.12));
  const radius = Math.round(size * 0.16);
  const isOutside = isOutsideRoundedRect(x, y, size, size, radius);

  if (isOutside) {
    return [0, 0, 0, 0];
  }

  const inset = margin + Math.round(size * 0.18);
  const barHeight = Math.max(2, Math.round(size * 0.12));
  const isTopBar = y >= margin && y < margin + barHeight && x >= margin && x < size - margin;
  const isInner = x >= inset && x < size - inset && y >= inset && y < size - margin;
  const isPopCorner = x >= Math.round(size * 0.57) && x < size - margin && y >= inset && y < Math.round(size * 0.52);

  if (isTopBar) {
    return [31, 43, 66, 255];
  }

  if (isPopCorner) {
    return [255, 255, 255, 255];
  }

  if (isInner) {
    return [124, 217, 187, 255];
  }

  const t = y / Math.max(1, size - 1);
  return [
    Math.round(22 + 30 * t),
    Math.round(99 + 92 * t),
    Math.round(255 - 35 * t),
    255
  ];
}

function isOutsideRoundedRect(x, y, width, height, radius) {
  const left = x < radius;
  const right = x >= width - radius;
  const top = y < radius;
  const bottom = y >= height - radius;

  if (!(left || right) || !(top || bottom)) {
    return false;
  }

  const cx = left ? radius : width - radius - 1;
  const cy = top ? radius : height - radius - 1;
  return Math.hypot(x - cx, y - cy) > radius;
}

function pngSignature() {
  return Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
}

function ihdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}
