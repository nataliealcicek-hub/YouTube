/* Renders each scene to its own MP4 by driving the deterministic canvas
   renderer in Chromium frame-by-frame and piping JPEGs into ffmpeg.

   Because every frame is a pure function of scene time t, frames can be
   produced in any order and a single block can be re-rendered in isolation
   without touching the others — that is what makes revision cheap.

   Usage:
     node render.js              render every scene
     node render.js 3 7          render only scenes 3 and 7 (1-based)
     node render.js --preview    three QA stills per scene, no encoding

   Config comes from scenes.js: SCENES (array of render functions) and
   optionally DUR (seconds per block, default 10).
*/
const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = Number(process.env.FPS || 30);
const W = Number(process.env.WIDTH || 1920);
const H = Number(process.env.HEIGHT || 1080);
const HERE = __dirname;
const OUT = path.join(HERE, 'clips');

/* ffmpeg: prefer a system binary, fall back to the one imageio ships. */
function findFfmpeg() {
  try { execSync('which ffmpeg', { stdio: 'pipe' }); return 'ffmpeg'; } catch (e) { /* keep looking */ }
  try {
    return execSync('python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"',
      { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim();
  } catch (e) {
    console.error('No ffmpeg found. Install one:  pip install imageio-ffmpeg');
    process.exit(1);
  }
}

/* Chromium: sandboxed environments often ship a browser whose build number
   does not match the installed playwright package, which makes the bundled
   launcher fail with "Executable doesn't exist". Prefer an explicit path,
   then any pre-installed build, then playwright's own download. */
function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers'].filter(Boolean);
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root)) {
      const p = path.join(root, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function encodeScene(idx, frames, ffmpeg) {
  return new Promise((resolve, reject) => {
    const out = path.join(OUT, `block-${String(idx + 1).padStart(2, '0')}.mp4`);
    const ff = spawn(ffmpeg, [
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
  const ffmpeg = findFfmpeg();
  const exe = findChromium();

  const browser = await chromium.launch({
    ...(exe ? { executablePath: exe } : {}),
    args: ['--force-color-profile=srgb', '--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.join(HERE, 'page.html'));
  await page.waitForFunction('window.__ready === true').catch(() => {
    throw new Error('page.html never became ready. Scene script errors:\n  ' +
      (errors.join('\n  ') || '(none captured — check the <script> tags)'));
  });

  // drive the canvas size from here so one scene set can output any aspect
  await page.evaluate(([w, h]) => setSize(w, h), [W, H]);

  const count = await page.evaluate(() => SCENES.length);
  const dur = await page.evaluate(() => (typeof DUR === 'number' ? DUR : 10));
  const list = picked.length ? picked.map(n => n - 1) : [...Array(count).keys()];
  console.log(`${count} scenes x ${dur}s @ ${W}x${H} ${FPS}fps`);

  if (preview) {
    const dir = path.join(HERE, 'preview');
    fs.mkdirSync(dir, { recursive: true });
    for (const i of list) {
      for (const t of [dur * .15, dur * .5, dur * .85]) {
        const b64 = await page.evaluate(([s, tt]) => frameJPEG(s, tt), [i, t]);
        fs.writeFileSync(path.join(dir, `s${String(i + 1).padStart(2, '0')}-t${t.toFixed(1)}.jpg`),
          Buffer.from(b64, 'base64'));
      }
      console.log(`preview scene ${i + 1}`);
    }
    await browser.close();
    console.log(`\nStills in ${dir} — look at them before rendering all frames.`);
    return;
  }

  const total = Math.round(dur * FPS);
  for (const i of list) {
    const t0 = Date.now();
    const frames = [];
    for (let f = 0; f < total; f++) {
      const b64 = await page.evaluate(([s, tt]) => frameJPEG(s, tt), [i, f / FPS]);
      frames.push(Buffer.from(b64, 'base64'));
    }
    const out = await encodeScene(i, frames, ffmpeg);
    console.log(`block ${String(i + 1).padStart(2, '0')} → ${path.basename(out)}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  if (errors.length) console.log(`\nNote: ${errors.length} page error(s):\n  ${errors.slice(0, 5).join('\n  ')}`);
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e.message || e); process.exit(1); });
