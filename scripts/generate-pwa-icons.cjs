const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to generate a simple uncompressed/deflated raw RGBA PNG buffer
function createPngBuffer(width, height, drawFn) {
  // 1. Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // 3. IDAT Data (Scanlines with filter byte 0)
  const rowSize = 1 + width * 4;
  const rawScanlines = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawScanlines[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawScanlines[pixelOffset] = r;
      rawScanlines[pixelOffset + 1] = g;
      rawScanlines[pixelOffset + 2] = b;
      rawScanlines[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', compressed);

  // 4. IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Design for App Icon: Dark Islamic Amber/Emerald theme with golden crescent/rosette star
function islamicIconDrawer(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = Math.min(w, h) / 2;

  // Background: Deep dark Islamic slate gradient
  const bgGrad = Math.min(255, Math.floor(18 + (y / h) * 12));
  let r = 18;
  let g = 20;
  let b = 26;
  let a = 255;

  const innerRadius = isMaskable ? radius * 0.72 : radius * 0.88;

  // Golden Outer Ring
  if (Math.abs(dist - innerRadius) < radius * 0.04) {
    return [217, 119, 6, 255]; // Amber 600
  }

  // Inner subtle background inside ring
  if (dist < innerRadius) {
    r = 26;
    g = 22;
    b = 16;

    // Star/Rosette geometry in center
    const starRadius = innerRadius * 0.65;
    if (dist < starRadius) {
      // 8-pointed star pattern calculation
      const angle = Math.atan2(dy, dx);
      const k = 8;
      const starR = starRadius * (0.7 + 0.3 * Math.abs(Math.cos(k * angle / 2)));
      if (dist < starR) {
        // Gold shimmer gradient
        const t = (dist / starR);
        r = Math.floor(217 * (1 - t * 0.3) + 245 * (t * 0.3));
        g = Math.floor(119 * (1 - t * 0.2) + 158 * (t * 0.2));
        b = 6;
      }
      
      // Center jewel
      if (dist < starRadius * 0.2) {
        return [254, 243, 199, 255]; // Amber 100 jewel
      }
    }
  }

  return [r, g, b, a];
}

// Generate the icons
console.log('Generating PWA Icons...');

const pwa192 = createPngBuffer(192, 192, (x, y, w, h) => islamicIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

const pwa512 = createPngBuffer(512, 512, (x, y, w, h) => islamicIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

const pwaMaskable512 = createPngBuffer(512, 512, (x, y, w, h) => islamicIconDrawer(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);

const appleTouchIcon = createPngBuffer(180, 180, (x, y, w, h) => islamicIconDrawer(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);

// Favicon copy
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), appleTouchIcon);

// Also generate public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#12141A"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="#D97706" stroke-width="14"/>
  <circle cx="256" cy="256" r="190" fill="#1C1814" stroke="#F59E0B" stroke-width="2"/>
  <!-- 8-pointed Islamic Star -->
  <g transform="translate(256, 256) scale(1.3)" fill="#D97706">
    <rect x="-60" y="-60" width="120" height="120" rx="6" />
    <rect x="-60" y="-60" width="120" height="120" rx="6" transform="rotate(45)" />
    <circle cx="0" cy="0" r="30" fill="#FEF3C7"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('PWA Icons generated successfully in public/');
