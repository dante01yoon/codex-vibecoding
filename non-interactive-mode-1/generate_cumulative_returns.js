const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WIDTH = 1400;
const HEIGHT = 900;

const font = {
  'A': ['010','101','111','101','101'],
  'B': ['110','101','110','101','110'],
  'C': ['011','100','100','100','011'],
  'D': ['110','101','101','101','110'],
  'E': ['111','100','110','100','111'],
  'F': ['111','100','110','100','100'],
  'G': ['011','100','101','101','011'],
  'H': ['101','101','111','101','101'],
  'I': ['111','010','010','010','111'],
  'J': ['001','001','001','101','010'],
  'K': ['101','101','110','101','101'],
  'L': ['100','100','100','100','111'],
  'M': ['101','111','111','101','101'],
  'N': ['101','111','111','111','101'],
  'O': ['111','101','101','101','111'],
  'P': ['110','101','110','100','100'],
  'Q': ['111','101','101','111','001'],
  'R': ['110','101','110','101','101'],
  'S': ['011','100','010','001','110'],
  'T': ['111','010','010','010','010'],
  'U': ['101','101','101','101','111'],
  'V': ['101','101','101','101','010'],
  'W': ['101','101','111','111','101'],
  'X': ['101','101','010','101','101'],
  'Y': ['101','101','010','010','010'],
  'Z': ['111','001','010','100','111'],
  '0': ['111','101','101','101','111'],
  '1': ['010','110','010','010','111'],
  '2': ['110','001','010','100','111'],
  '3': ['111','001','011','001','111'],
  '4': ['101','101','111','001','001'],
  '5': ['111','100','110','001','110'],
  '6': ['011','100','110','101','010'],
  '7': ['111','001','010','100','100'],
  '8': ['010','101','010','101','010'],
  '9': ['010','101','011','001','110'],
  '%': ['100','001','010','100','001'],
  '.': ['000','000','000','000','010'],
  '-': ['000','000','111','000','000'],
  ':': ['000','010','000','010','000'],
  '(': ['001','010','010','010','001'],
  ')': ['100','010','010','010','100'],
  ' ': ['000','000','000','000','000'],
};

function hex(color, alpha = 255) {
  const value = color.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    a: alpha,
  };
}

const image = Buffer.alloc(WIDTH * HEIGHT * 4);

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const i = (Math.floor(y) * WIDTH + Math.floor(x)) * 4;
  const srcA = color.a / 255;
  const dstA = image[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  image[i] = Math.round((color.r * srcA + image[i] * dstA * (1 - srcA)) / outA);
  image[i + 1] = Math.round((color.g * srcA + image[i + 1] * dstA * (1 - srcA)) / outA);
  image[i + 2] = Math.round((color.b * srcA + image[i + 2] * dstA * (1 - srcA)) / outA);
  image[i + 3] = Math.round(outA * 255);
}

function fillRect(x, y, width, height, color) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(WIDTH, Math.ceil(x + width));
  const y1 = Math.min(HEIGHT, Math.ceil(y + height));
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) {
      setPixel(xx, yy, color);
    }
  }
}

function fillCircle(cx, cy, radius, color) {
  const r2 = radius * radius;
  const x0 = Math.floor(cx - radius);
  const x1 = Math.ceil(cx + radius);
  const y0 = Math.floor(cy - radius);
  const y1 = Math.ceil(cy + radius);
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(x, y, color);
    }
  }
}

function drawLine(x0, y0, x1, y1, color, thickness = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    fillCircle(x, y, thickness / 2, color);
  }
}

function fillRoundedRect(x, y, width, height, radius, color) {
  fillRect(x + radius, y, width - radius * 2, height, color);
  fillRect(x, y + radius, radius, height - radius * 2, color);
  fillRect(x + width - radius, y + radius, radius, height - radius * 2, color);
  fillCircle(x + radius, y + radius, radius, color);
  fillCircle(x + width - radius, y + radius, radius, color);
  fillCircle(x + radius, y + height - radius, radius, color);
  fillCircle(x + width - radius, y + height - radius, radius, color);
}

function strokeRect(x, y, width, height, color, thickness = 1) {
  fillRect(x, y, width, thickness, color);
  fillRect(x, y + height - thickness, width, thickness, color);
  fillRect(x, y, thickness, height, color);
  fillRect(x + width - thickness, y, thickness, height, color);
}

function drawText(text, x, y, scale, color, gap = scale) {
  let cursor = x;
  const upper = text.toUpperCase();
  for (const char of upper) {
    const glyph = font[char] || font[' '];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === '1') {
          fillRect(cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += glyph[0].length * scale + gap;
  }
}

function textWidth(text, scale, gap = scale) {
  let width = 0;
  const upper = text.toUpperCase();
  for (let i = 0; i < upper.length; i += 1) {
    const glyph = font[upper[i]] || font[' '];
    width += glyph[0].length * scale;
    if (i < upper.length - 1) width += gap;
  }
  return width;
}

function drawTextRight(text, right, y, scale, color, gap = scale) {
  drawText(text, right - textWidth(text, scale, gap), y, scale, color, gap);
}

function drawTextCentered(text, centerX, y, scale, color, gap = scale) {
  drawText(text, Math.round(centerX - textWidth(text, scale, gap) / 2), y, scale, color, gap);
}

function percent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePNG(rgba, width, height) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    rows.push(Buffer.from([0]));
    rows.push(rgba.subarray(start, start + width * 4));
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', header),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const csvPath = path.join(process.cwd(), 'stock_summary.csv');
const outPath = path.join(process.cwd(), 'cumulative_returns.png');

const csv = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const header = csv.shift();
if (!header || !header.includes('Cumulative Return')) {
  throw new Error('stock_summary.csv does not contain the expected header.');
}

const rows = Object.fromEntries(
  csv
    .map((line) => line.split(','))
    .filter((parts) => parts.length >= 4)
    .map((parts) => [parts[0], Number(parts[3])])
);

const values = {
  MIN: rows['min'],
  Q1: rows['25%'],
  MED: rows['50%'],
  MEAN: rows['mean'],
  Q3: rows['75%'],
  MAX: rows['max'],
};

const extras = {
  COUNT: rows['count'],
  STD: rows['std'],
};

for (const [key, value] of Object.entries({ ...values, ...extras })) {
  if (!Number.isFinite(value)) {
    throw new Error(`Missing or invalid numeric value for ${key}.`);
  }
}

const topBg = hex('#f4efe7');
const bottomBg = hex('#dbe7f1');
for (let y = 0; y < HEIGHT; y += 1) {
  const t = y / (HEIGHT - 1);
  const color = {
    r: Math.round(topBg.r + (bottomBg.r - topBg.r) * t),
    g: Math.round(topBg.g + (bottomBg.g - topBg.g) * t),
    b: Math.round(topBg.b + (bottomBg.b - topBg.b) * t),
    a: 255,
  };
  fillRect(0, y, WIDTH, 1, color);
}

fillCircle(180, 140, 110, hex('#ffffff', 65));
fillCircle(1180, 760, 160, hex('#ffffff', 70));
fillCircle(1280, 180, 90, hex('#f1cbb5', 45));
fillRoundedRect(70, 70, WIDTH - 140, HEIGHT - 140, 28, hex('#ffffff', 232));
strokeRect(70, 70, WIDTH - 140, HEIGHT - 140, hex('#dae3eb', 180), 2);

const titleColor = hex('#11253b');
const subtitleColor = hex('#5e7185');
const accent = hex('#245d85');
const accentSoft = hex('#3c8dbc', 55);
const meanColor = hex('#d66a4f');
const gridColor = hex('#d8e0e7');
const axisColor = hex('#91a3b6');
const bandColor = hex('#6ea6c8', 46);
const bandOutline = hex('#6a9cbe', 130);
const labelColor = hex('#1b3247');
const badgeBg = hex('#17324a');
const badgeText = hex('#f8fafc');

drawText('CUMULATIVE RETURN SUMMARY', 120, 118, 8, titleColor, 3);
drawText('SUMMARY STATS ONLY', 120, 182, 4, subtitleColor, 2);
fillRoundedRect(1050, 116, 220, 56, 16, badgeBg);
drawTextCentered('NOT A DAILY SERIES', 1160, 134, 4, badgeText, 2);

const chart = { x: 150, y: 260, width: 1040, height: 480 };
const side = { x: 1210, y: 300, width: 130, height: 310 };

const yMin = -0.05;
const yMax = 0.65;
const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

function yOf(value) {
  const ratio = (value - yMin) / (yMax - yMin);
  return Math.round(chart.y + chart.height - ratio * chart.height);
}

for (const tick of ticks) {
  const y = yOf(tick);
  drawLine(chart.x, y, chart.x + chart.width, y, gridColor, 1);
  drawTextRight(percent(tick, 0), chart.x - 24, y - 12, 4, subtitleColor, 1);
}

drawLine(chart.x, chart.y, chart.x, chart.y + chart.height, axisColor, 3);
drawLine(chart.x, chart.y + chart.height, chart.x + chart.width, chart.y + chart.height, axisColor, 3);

const q1Y = yOf(values.Q1);
const q3Y = yOf(values.Q3);
fillRoundedRect(chart.x + 18, q3Y, chart.width - 36, q1Y - q3Y, 16, bandColor);
strokeRect(chart.x + 18, q3Y, chart.width - 36, q1Y - q3Y, bandOutline, 2);
drawText('IQR BAND', chart.x + 34, q3Y + 18, 4, hex('#2d5a7b'), 1);

const labels = Object.keys(values);
const points = labels.map((label, index) => {
  const x = Math.round(chart.x + 80 + index * ((chart.width - 160) / (labels.length - 1)));
  const y = yOf(values[label]);
  return { label, x, y, value: values[label] };
});

for (const point of points) {
  drawLine(point.x, chart.y + chart.height, point.x, chart.y + 20, hex('#e3e9ef'), 1);
}

for (let i = 0; i < points.length - 1; i += 1) {
  const a = points[i];
  const b = points[i + 1];
  const steps = Math.max(1, Math.abs(b.x - a.x));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = Math.round(a.x + (b.x - a.x) * t);
    const y = Math.round(a.y + (b.y - a.y) * t);
    drawLine(x, y, x, chart.y + chart.height, accentSoft, 1);
  }
}

for (let i = 0; i < points.length - 1; i += 1) {
  drawLine(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, accent, 6);
}

for (const point of points) {
  const color = point.label === 'MEAN' ? meanColor : accent;
  fillCircle(point.x, point.y, point.label === 'MEAN' ? 12 : 10, hex('#ffffff'));
  fillCircle(point.x, point.y, point.label === 'MEAN' ? 8 : 7, color);
  drawTextCentered(point.label, point.x, chart.y + chart.height + 32, 4, labelColor, 1);
  drawTextCentered(percent(point.value, 1), point.x, point.y - 36, 4, color, 1);
}

drawText('CUMULATIVE RETURN (%)', chart.x + 10, chart.y - 34, 4, subtitleColor, 1);

fillRoundedRect(side.x, side.y, side.width, side.height, 18, hex('#f4f8fb', 240));
strokeRect(side.x, side.y, side.width, side.height, hex('#d9e3eb'), 2);
drawText('DETAIL', side.x + 18, side.y + 20, 5, titleColor, 2);
drawText('COUNT', side.x + 18, side.y + 70, 4, subtitleColor, 1);
drawText(String(Math.round(extras.COUNT)), side.x + 18, side.y + 96, 6, titleColor, 2);
drawText('STD', side.x + 18, side.y + 158, 4, subtitleColor, 1);
drawText(percent(extras.STD, 1), side.x + 18, side.y + 184, 6, titleColor, 2);
drawText('RANGE', side.x + 18, side.y + 246, 4, subtitleColor, 1);
drawText(percent(values.MIN, 1), side.x + 18, side.y + 272, 4, titleColor, 1);
drawText(percent(values.MAX, 1), side.x + 18, side.y + 300, 4, titleColor, 1);

drawText('SOURCE: STOCK_SUMMARY.CSV', 120, 804, 4, subtitleColor, 1);
drawText('RAW DAILY OBSERVATIONS ARE NOT PRESENT IN THE CSV.', 120, 836, 4, subtitleColor, 1);

const png = encodePNG(image, WIDTH, HEIGHT);
fs.writeFileSync(outPath, png);
console.log(`Wrote ${outPath}`);
