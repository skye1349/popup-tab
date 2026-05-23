import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

mkdirSync("store-assets", { recursive: true });
writeFileSync("store-assets/small-promo-440x280.png", createSmallPromo());
writeFileSync("store-assets/screenshot-options-1280x800.png", createScreenshot());

function createSmallPromo() {
  const width = 440;
  const height = 280;
  const rows = [];

  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;

    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      const color = getPromoPixel(x, y, width, height);
      row[offset] = color[0];
      row[offset + 1] = color[1];
      row[offset + 2] = color[2];
      row[offset + 3] = color[3];
    }

    rows.push(row);
  }

  return Buffer.concat([
    pngSignature(),
    chunk("IHDR", ihdr(width, height)),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function createScreenshot() {
  const width = 1280;
  const height = 800;
  const rows = [];

  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;

    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      const color = getScreenshotPixel(x, y, width, height);
      row[offset] = color[0];
      row[offset + 1] = color[1];
      row[offset + 2] = color[2];
      row[offset + 3] = color[3];
    }

    rows.push(row);
  }

  return Buffer.concat([
    pngSignature(),
    chunk("IHDR", ihdr(width, height)),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function getPromoPixel(x, y, width, height) {
  const t = y / Math.max(1, height - 1);
  let color = [
    Math.round(16 + 36 * t),
    Math.round(91 + 86 * t),
    Math.round(242 - 18 * t),
    255
  ];

  color = blend(color, [124, 217, 187, 255], softCircle(x, y, 332, 78, 122) * 0.58);
  color = blend(color, [255, 255, 255, 255], softCircle(x, y, 138, 210, 94) * 0.18);

  const mainWindow = roundedRectMask(x, y, 62, 54, 204, 138, 16);
  const popupWindow = roundedRectMask(x, y, 206, 92, 174, 120, 14);
  const arrow = arrowMask(x, y);

  if (mainWindow) {
    color = [244, 248, 255, 255];
  }

  if (mainWindow && y >= 54 && y < 78) {
    color = [31, 43, 66, 255];
  }

  if (mainWindow && x >= 88 && x < 238 && y >= 104 && y < 118) {
    color = [201, 214, 235, 255];
  }

  if (mainWindow && x >= 88 && x < 204 && y >= 136 && y < 150) {
    color = [201, 214, 235, 255];
  }

  if (popupWindow) {
    color = [255, 255, 255, 255];
  }

  if (popupWindow && y >= 92 && y < 116) {
    color = [31, 43, 66, 255];
  }

  if (popupWindow && x >= 232 && x < 348 && y >= 144 && y < 158) {
    color = [124, 217, 187, 255];
  }

  if (popupWindow && x >= 232 && x < 320 && y >= 170 && y < 184) {
    color = [124, 217, 187, 255];
  }

  if (arrow) {
    color = [124, 217, 187, 255];
  }

  const shadow = softRect(x, y, 66, 60, 320, 164, 24);
  if (!mainWindow && !popupWindow && shadow > 0) {
    color = blend(color, [8, 18, 38, 255], shadow * 0.18);
  }

  return color;
}

function getScreenshotPixel(x, y, width, height) {
  let color = [245, 247, 251, 255];
  const shellLeft = 260;
  const shellTop = 84;
  const cardWidth = 760;

  const hero = roundedRectMask(x, y, shellLeft, shellTop, cardWidth, 168, 8);
  const shortcut = roundedRectMask(x, y, shellLeft, 272, cardWidth, 192, 8);
  const defaults = roundedRectMask(x, y, shellLeft, 484, cardWidth, 210, 8);

  if (hero || shortcut || defaults) {
    color = [255, 255, 255, 255];
  }

  if (isBorder(x, y, shellLeft, shellTop, cardWidth, 168, 8) || isBorder(x, y, shellLeft, 272, cardWidth, 192, 8) || isBorder(x, y, shellLeft, 484, cardWidth, 210, 8)) {
    color = [217, 224, 236, 255];
  }

  if (roundedRectMask(x, y, shellLeft + 28, shellTop + 48, 72, 72, 14)) {
    const t = (y - shellTop - 48) / 72;
    color = [
      Math.round(22 + 30 * t),
      Math.round(99 + 92 * t),
      Math.round(255 - 35 * t),
      255
    ];
  }

  color = drawTextLines(color, x, y, shellLeft + 124, shellTop + 46, [210, 138], [23, 32, 51, 255]);
  color = drawTextLines(color, x, y, shellLeft + 124, shellTop + 96, [452], [83, 98, 122, 255]);
  color = drawTextLines(color, x, y, shellLeft + 24, 300, [168], [23, 32, 51, 255]);
  color = drawTextLines(color, x, y, shellLeft + 24, 344, [640, 584], [83, 98, 122, 255]);

  if (roundedRectMask(x, y, shellLeft + 24, 408, 208, 40, 6)) {
    color = [20, 99, 255, 255];
  }

  color = drawTextLines(color, x, y, shellLeft + 24, 512, [144], [23, 32, 51, 255]);
  color = drawTextLines(color, x, y, shellLeft + 24, 568, [86], [83, 98, 122, 255]);
  color = drawKeyboardRow(color, x, y, shellLeft + 292, 552, [94, 54, 40], [23, 32, 51, 255]);
  color = drawTextLines(color, x, y, shellLeft + 24, 638, [210], [83, 98, 122, 255]);
  color = drawKeyboardRow(color, x, y, shellLeft + 292, 622, [42, 28], [23, 32, 51, 255]);

  return color;
}

function drawTextLines(color, x, y, left, top, lengths, textColor) {
  for (let i = 0; i < lengths.length; i += 1) {
    const lineTop = top + i * 26;
    if (roundedRectMask(x, y, left, lineTop, lengths[i], 12, 3)) {
      return textColor;
    }
  }

  return color;
}

function drawKeyboardRow(color, x, y, left, top, widths, textColor) {
  let cursor = left;

  for (const width of widths) {
    if (roundedRectMask(x, y, cursor, top, width, 34, 6)) {
      return [247, 249, 252, 255];
    }

    if (isBorder(x, y, cursor, top, width, 34, 6)) {
      return [201, 210, 225, 255];
    }

    if (roundedRectMask(x, y, cursor + 10, top + 12, Math.max(8, width - 20), 8, 2)) {
      return textColor;
    }

    cursor += width + 28;
  }

  return color;
}

function isBorder(x, y, left, top, width, height, radius) {
  return roundedRectMask(x, y, left, top, width, height, radius) && !roundedRectMask(x, y, left + 1, top + 1, width - 2, height - 2, Math.max(0, radius - 1));
}

function roundedRectMask(x, y, left, top, width, height, radius) {
  if (x < left || x >= left + width || y < top || y >= top + height) {
    return false;
  }

  const cornerX = x < left + radius ? left + radius : x >= left + width - radius ? left + width - radius - 1 : x;
  const cornerY = y < top + radius ? top + radius : y >= top + height - radius ? top + height - radius - 1 : y;
  return Math.hypot(x - cornerX, y - cornerY) <= radius;
}

function arrowMask(x, y) {
  const shaft = x >= 166 && x <= 214 && y >= 132 && y <= 144;
  const head = x >= 204 && x <= 236 && Math.abs(y - 138) <= (236 - x) * 0.45;
  return shaft || head;
}

function softCircle(x, y, cx, cy, radius) {
  return clamp(1 - Math.hypot(x - cx, y - cy) / radius, 0, 1);
}

function softRect(x, y, left, top, width, height, blur) {
  const dx = Math.max(left - x, 0, x - (left + width));
  const dy = Math.max(top - y, 0, y - (top + height));
  return clamp(1 - Math.hypot(dx, dy) / blur, 0, 1);
}

function blend(base, over, alpha) {
  return [
    Math.round(base[0] * (1 - alpha) + over[0] * alpha),
    Math.round(base[1] * (1 - alpha) + over[1] * alpha),
    Math.round(base[2] * (1 - alpha) + over[2] * alpha),
    255
  ];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
