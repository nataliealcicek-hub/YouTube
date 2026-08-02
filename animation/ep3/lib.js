/* Episode 2 — shared drawing toolkit.
   Flat cut-paper / gouache aesthetic, deterministic: every visual is a pure
   function of scene time t, so frames can be rendered out of order. */

const P = {
  cream:   '#EFE3CE',
  paper:   '#E3D2B6',
  ink:     '#171216',
  crimson: '#9E2A3B',
  crimDeep:'#4B1220',
  crimDark:'#2B0C16',
  teal:    '#1FD3C6',
  tealDeep:'#0E8F88',
  gold:    '#F3C34A',
  goldDeep:'#B8862A',
  acid:    '#C9D94B',
  sick:    '#7FB069',
  grey:    '#6A6167',
  /* Episode 3 colour code */
  lav:     '#B08CE8',   // glycine
  lavDeep: '#6E4BA8',
  amber:   '#F5A742',   // calcium
  amberDeep:'#B96F1C',
  slate:   '#1A1030',   // environment
  chalk:   '#CFC3B4',   // undissolved mineral
};

const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, u) => a + (b - a) * u;
const smoothstep = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const easeInOut = u => (u = clamp(u, 0, 1)) < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const easeOut = u => 1 - Math.pow(1 - clamp(u, 0, 1), 3);
const pulse = (t, period, w) => Math.exp(-Math.pow(((t % period) / period - .5) * w, 2));

/* deterministic hash-based PRNG — rnd(i) is stable across frames */
function rnd(i) {
  let x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function rrange(i, a, b) { return a + rnd(i) * (b - a); }

/* ---------- texture ---------- */
let _grain = null;
function grainTile(doc) {
  if (_grain) return _grain;
  const c = doc.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) {
    const v = 128 + (rnd(i * 1.37) - .5) * 190;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  _grain = c;
  return c;
}

function grain(ctx, W, H, alpha, doc) {
  const tile = grainTile(doc);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = alpha;
  for (let x = 0; x < W; x += 256) for (let y = 0; y < H; y += 256) ctx.drawImage(tile, x, y);
  ctx.restore();
}

function vignette(ctx, W, H, strength) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(8,4,8,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function bg(ctx, W, H, inner, outer) {
  const g = ctx.createRadialGradient(W / 2, H * .5, 0, W / 2, H * .5, H * 1.05);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* ---------- primitives ---------- */
function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(color, alpha));
  g.addColorStop(.45, hexA(color, alpha * .35));
  g.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a, 0, 1)})`;
}

/* organic wobbling blob, cut-paper silhouette */
function blobPath(ctx, cx, cy, r, wob, t, seed, lobes) {
  lobes = lobes || 7;
  ctx.beginPath();
  const steps = 90;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * TAU;
    let rr = r;
    for (let k = 1; k <= 3; k++) {
      rr += Math.sin(a * (lobes + k) + t * (.5 + k * .25) + rrange(seed * 7 + k, 0, TAU)) * r * wob / k;
    }
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

/* draw a shape with a cut-paper drop shadow beneath it */
function paper(ctx, pathFn, fill, shadowA, dx, dy) {
  ctx.save();
  ctx.translate(dx === undefined ? 6 : dx, dy === undefined ? 10 : dy);
  pathFn();
  ctx.fillStyle = `rgba(10,4,10,${shadowA === undefined ? .35 : shadowA})`;
  ctx.fill();
  ctx.restore();
  pathFn();
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokePath(ctx, pathFn, color, w, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  pathFn();
  ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

/* smooth curve through points */
function curve(ctx, pts, close) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  if (close) ctx.closePath();
}

/* ---------- labels (leader line + small caps) ---------- */
function label(ctx, tx, ty, ax, ay, text, alpha, color, size) {
  if (alpha <= .01) return;
  color = color || P.cream;
  size = size || 26;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);

  // keep the text block inside the safe area, flipping sides if it would clip
  const M = 54, cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.font = `500 ${size}px "DejaVu Sans", Arial, sans-serif`;
  const tw = ctx.measureText(text).width;
  let right = tx < ax;                       // text sits left of anchor, right-aligned
  if (right && tx - tw - 6 < M) {
    if (ax + tw + 60 < cw - M) { right = false; tx = ax + 60; }
    else tx = M + tw + 6;
  } else if (!right && tx + tw + 6 > cw - M) {
    if (ax - tw - 60 > M) { right = true; tx = ax - 60; }
    else tx = cw - M - tw - 6;
  }
  ty = clamp(ty, M, ch - M);
  ctx.strokeStyle = hexA(color, .75);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ax, ay, 5, 0, TAU);
  ctx.moveTo(ax, ay);
  ctx.lineTo(right ? tx + 14 : tx - 14, ty);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = right ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, tx + (right ? -6 : 6), ty);
  ctx.restore();
}

/* fade helper for a scene: dark in/out at the seams so blocks cut cleanly */
function seams(ctx, W, H, t, dur) {
  const a = 1 - smoothstep(0, .55, t) * smoothstep(0, .55, dur - t);
  if (a > .001) { ctx.fillStyle = `rgba(8,4,8,${a})`; ctx.fillRect(0, 0, W, H); }
}

/* travelling pulses along a polyline path */
function pulsesAlong(ctx, pts, t, speed, count, color, size, phase) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push(d); total += d;
  }
  for (let k = 0; k < count; k++) {
    let u = ((t * speed + k / count + (phase || 0)) % 1) * total;
    for (let i = 0; i < segs.length; i++) {
      if (u <= segs[i]) {
        const f = u / segs[i];
        const x = lerp(pts[i][0], pts[i + 1][0], f), y = lerp(pts[i][1], pts[i + 1][1], f);
        glow(ctx, x, y, size * 3, color, .5);
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, size, 0, TAU); ctx.fill();
        break;
      }
      u -= segs[i];
    }
  }
}
