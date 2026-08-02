/* Renders the 12 blocks to 1920x1080 MP4s by driving the deterministic
   canvas renderer in Chromium frame by frame and piping JPEGs into ffmpeg.
   Usage:
     node render.js            → render all 12 blocks
     node render.js 3 7        → render only blocks 3 and 7 (1-based)
     node render.js --preview  → one PNG per block for visual QA
*/
const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, DUR = 10, W = 1920, H = 1080;
const HERE = __dirname;
const OUT = path.join(HERE, 'clips');
const FFMPEG = execSync(
  'python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"'
).toString().trim();

function encodeScene(idx, frames) {
  return new Promise((resolve, reject) => {
    const out = path.join(OUT, `block-${String(idx + 1).padStart(2, '0')}.mp4`);
    const ff = spawn(FFMPEG, [
      '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', String(FPS), '-i', 'pipe:0',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
      '-pix_fmt', 'yuv420p', '-r', String(FPS),
      '-movflags', '+faststart', out,
    ], { stdio: ['pipe', 'ignore', 'pipe'] });
    let err = '';
    ff.stderr.on('data', d => { err += d.toString(); });
    ff.on('close', c => c === 0 ? resolve(out) : reject(new Error(err.slice(-2000))));
    (async () => {
      for (const b of frames) {
        if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r));
      }
      ff.stdin.end();
    })();
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const picked = args.filter(a => /^\d+$/.test(a)).map(Number);

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + path.join(HERE, 'page.html'));
  await page.waitForFunction('window.__ready === true');

  const list = picked.length ? picked.map(n => n - 1) : [...Array(12).keys()];

  if (preview) {
    fs.mkdirSync(path.join(HERE, 'preview'), { recursive: true });
    for (const i of list) {
      for (const t of [1.5, 5.0, 8.5]) {
        const b64 = await page.evaluate(([s, tt]) => frameJPEG(s, tt), [i, t]);
        fs.writeFileSync(
          path.join(HERE, 'preview', `s${String(i + 1).padStart(2, '0')}-t${t}.jpg`),
          Buffer.from(b64, 'base64'));
      }
      console.log(`preview block ${i + 1}`);
    }
    await browser.close();
    return;
  }

  const total = DUR * FPS;
  for (const i of list) {
    const t0 = Date.now();
    const frames = [];
    for (let f = 0; f < total; f++) {
      const b64 = await page.evaluate(([s, tt]) => frameJPEG(s, tt), [i, f / FPS]);
      frames.push(Buffer.from(b64, 'base64'));
    }
    const out = await encodeScene(i, frames);
    console.log(`block ${String(i + 1).padStart(2, '0')} → ${path.basename(out)}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
