const { PNG } = require("pngjs");
const fs = require("fs");
const path = require("path");

const W = 32, H = 32;
const png = new PNG({ width: W, height: H, filterType: -1 });

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (W * y + x) * 4;
  png.data[i]     = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = a;
}

// Background: #0e0e16
for (let i = 0; i < W * H * 4; i += 4) {
  png.data[i]     = 14;
  png.data[i + 1] = 14;
  png.data[i + 2] = 22;
  png.data[i + 3] = 255;
}

function sign(p1, p2, p3) {
  return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
}

function inTriangle(pt, v1, v2, v3) {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

function fillPolygon(points, r, g, b) {
  for (let t = 1; t < points.length - 1; t++) {
    const v1 = points[0], v2 = points[t], v3 = points[t + 1];
    const minX = Math.max(0, Math.floor(Math.min(v1[0], v2[0], v3[0])));
    const maxX = Math.min(W - 1, Math.ceil(Math.max(v1[0], v2[0], v3[0])));
    const minY = Math.max(0, Math.floor(Math.min(v1[1], v2[1], v3[1])));
    const maxY = Math.min(H - 1, Math.ceil(Math.max(v1[1], v2[1], v3[1])));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (inTriangle([x + 0.5, y + 0.5], v1, v2, v3)) {
          setPixel(x, y, r, g, b);
        }
      }
    }
  }
}

// Isometric cube — top, right, left faces
fillPolygon([[16, 5], [27, 11], [16, 17], [5, 11]], 255, 80, 104);  // top  (#ff5068)
fillPolygon([[27, 11], [16, 17], [16, 27], [27, 21]], 250, 50, 77); // right (#fa324d)
fillPolygon([[5, 11], [16, 17], [16, 27], [5, 21]], 176, 16, 48);   // left  (#b01030)

// PNG → ICO wrapper
const pngBuf = PNG.sync.write(png);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);   // reserved
header.writeUInt16LE(1, 2);   // type: icon
header.writeUInt16LE(1, 4);   // image count

const dir = Buffer.alloc(16);
dir.writeUInt8(32, 0);                          // width
dir.writeUInt8(32, 1);                          // height
dir.writeUInt8(0, 2);                           // color count
dir.writeUInt8(0, 3);                           // reserved
dir.writeUInt16LE(0, 4);                        // planes
dir.writeUInt16LE(0, 6);                        // bit count
dir.writeUInt32LE(pngBuf.length, 8);            // bytes in image
dir.writeUInt32LE(6 + 16, 12);                  // offset to image data

const ico = Buffer.concat([header, dir, pngBuf]);
const out = path.join(__dirname, "..", "public", "favicon.ico");
fs.writeFileSync(out, ico);
console.log(`favicon.ico written — ${ico.length} bytes`);
