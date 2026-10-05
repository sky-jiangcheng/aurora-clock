// Pixel-level verification of the generated screenshots.
//
// Written because the vision model misreported these images twice (claiming the
// weather shot showed the CLOCK tab and a truncated forecast, when the DOM
// said otherwise). Ground truth is decoded straight from the PNG bytes.
//
//   node test/verify-shots.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');

function decodePNG(file) {
  const d = fs.readFileSync(file);
  let pos = 8, idat = [], w = 0, h = 0, ct = 6;
  while (pos < d.length) {
    const len = d.readUInt32BE(pos);
    const type = d.toString('ascii', pos + 4, pos + 8);
    const data = d.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(pos + 8); h = d.readUInt32BE(pos + 12); ct = d[pos + 17]; }
    else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = ct === 6 ? 4 : 3;
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride), i = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[i++];
    const line = Buffer.from(raw.subarray(i, i + stride)); i += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      if (f === 1) line[x] = (line[x] + a) & 255;
      else if (f === 2) line[x] = (line[x] + b) & 255;
      else if (f === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    line.copy(out, y * stride); prev = line;
  }
  return { w, h, bpp, px: out };
}

const lum = (img, x, y) => {
  const o = (y * img.w + x) * img.bpp;
  return 0.299 * img.px[o] + 0.587 * img.px[o + 1] + 0.114 * img.px[o + 2];
};

// Brightest run of text pixels in a band, as a fraction of the band width.
function textProfile(img, y0, y1) {
  let best = 0, col = -1;
  for (let x = 0; x < img.w; x += 2) {
    let m = 0;
    for (let y = y0; y < y1; y++) m = Math.max(m, lum(img, x, y));
    if (m > best) { best = m; col = x; }
  }
  return { peak: best, x: col };
}

let failures = 0;
function check(label, ok, detail) {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
}

const shots = {
  'clock-classic': 'clock', 'clock-neon': 'clock', 'clock-ocean': 'clock',
  'clock-light': 'clock', world: 'world', weather: 'weather'
};

const imgs = {};
for (const name of Object.keys(shots)) {
  imgs[name] = decodePNG(path.join(ROOT, 'docs/screenshots', name + '.png'));
}

console.log('=== 尺寸 ===');
for (const [n, img] of Object.entries(imgs)) {
  check(n, img.w === 1120 && img.h === 1120, `${img.w}x${img.h}`);
}

console.log('\n=== 图像各不相同（不是同一张复制） ===');
const sig = {};
for (const [n, img] of Object.entries(imgs)) {
  let hsh = 0;
  for (let y = 0; y < img.h; y += 16) for (let x = 0; x < img.w; x += 16) hsh = (hsh * 31 + Math.round(lum(img, x, y))) >>> 0;
  sig[n] = hsh;
}
const uniq = new Set(Object.values(sig));
check('6 张图各不相同', uniq.size === 6, `${uniq.size} 个唯一哈希`);

console.log('\n=== 明暗主题确实不同 ===');
{
  const dark = imgs['clock-classic'], light = imgs['clock-light'];
  const avg = (img) => { let s = 0, c = 0; for (let y = 0; y < img.h; y += 8) for (let x = 0; x < img.w; x += 8) { s += lum(img, x, y); c++; } return s / c; };
  const ad = avg(dark), al = avg(light);
  check('浅色模式明显更亮', al > ad + 30, `dark=${ad.toFixed(1)} light=${al.toFixed(1)}`);
}

console.log('\n=== 表盘样式确实不同 ===');
for (const pair of [['clock-classic', 'clock-neon'], ['clock-classic', 'clock-ocean'], ['clock-neon', 'clock-ocean']]) {
  check(`${pair[0]} ≠ ${pair[1]}`, sig[pair[0]] !== sig[pair[1]]);
}

console.log('\n=== 天气页与时钟页内容不同 ===');
check('weather ≠ clock', sig.weather !== sig['clock-classic']);
{
  // Both pages share the same dark sky background, so comparing mean
  // brightness over a large region drowns the signal in background. The
  // reliable discriminator is TEXT DENSITY: the weather tab is a card-based
  // panel packed with labels and figures, the clock tab is mostly empty sky.
  const textDensity = (img, y0, y1) => {
    let n = 0, c = 0;
    for (let y = y0; y < y1; y += 3) {
      for (let x = 20; x < img.w - 20; x += 3) { if (lum(img, x, y) > 110) n++; c++; }
    }
    return 100 * n / c;
  };
  const wUp = textDensity(imgs.weather, 120, 400);
  const cUp = textDensity(imgs['clock-classic'], 120, 400);
  check('天气页上部文字密度显著更高', wUp > cUp + 1,
    `weather=${wUp.toFixed(2)}% clock=${cUp.toFixed(2)}%`);

  const wLo = textDensity(imgs.weather, 700, 1050);
  const cLo = textDensity(imgs['clock-classic'], 700, 1050);
  check('天气页下部有预报行', wLo > cLo + 0.4,
    `weather=${wLo.toFixed(2)}% clock=${cLo.toFixed(2)}%`);
}

console.log('\n=== 各页有实际内容（非空白） ===');
for (const [n, img] of Object.entries(imgs)) {
  let mn = 255, mx = 0;
  for (let y = 0; y < img.h; y += 6) for (let x = 0; x < img.w; x += 6) { const l = lum(img, x, y); if (l < mn) mn = l; if (l > mx) mx = l; }
  check(`${n} 有对比度`, mx - mn > 60, `min=${mn.toFixed(0)} max=${mx.toFixed(0)} range=${(mx - mn).toFixed(0)}`);
}

console.log('\n=== 顶栏 tab 高亮位置 ===');
{
  // The active tab renders as a filled pill, so its band is brighter than the
  // two inactive labels. Scan the top bar for the three label clusters.
  for (const [n, want] of [['clock-classic', 'clock'], ['world', 'world'], ['weather', 'weather']]) {
    const img = imgs[n];
    const prof = textProfile(img, 88, 116);
    const wantX = want === 'clock' ? 760 : want === 'world' ? 900 : 1030;
    const ok = Math.abs(prof.x - wantX) < 120;
    check(`${n} 高亮≈${want}`, ok, `峰值x=${prof.x} 期望≈${wantX}`);
  }
}

console.log(failures === 0 ? '\n全部通过' : `\n${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);