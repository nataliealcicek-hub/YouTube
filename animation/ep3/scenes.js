/* Episode 3 — "The Mineral That Lets You Let Go"
   Colour code held throughout: teal = magnesium, lavender = glycine,
   amber = calcium, gold = energy, acid = distress. */

const DUR = 10;

function motes(ctx, W, H, t, n, color, alpha) {
  for (let i = 0; i < n; i++) {
    const x = (rrange(i, 0, W) + t * rrange(i + 500, -12, 12) + W) % W;
    const y = (rrange(i + 90, 0, H) + t * rrange(i + 700, -18, -3) + H * 2) % H;
    ctx.fillStyle = hexA(color, alpha * (.3 + .7 * Math.abs(Math.sin(t * .6 + i))));
    ctx.beginPath(); ctx.arc(x, y, rrange(i + 40, 1.2, 3.4), 0, TAU); ctx.fill();
  }
}

/* ---------- 1. the mineral that has to be there — and mostly isn't enough ---------- */
function scene1(ctx, t, W, H) {
  bg(ctx, W, H, '#241748', '#080513');
  motes(ctx, W, H, t, 40, P.teal, .16);

  const z = lerp(.88, 1.02, easeInOut(t / DUR));
  ctx.save();
  ctx.translate(W / 2, H / 2 + 30);
  ctx.scale(z, z);

  paper(ctx, () => figurePath(ctx, 0), hexA(P.cream, .12), .28, 8, 12);
  strokePath(ctx, () => figurePath(ctx, 0), hexA(P.cream, .40), 3);

  // three demands, arriving one after another: heart, muscle, nerve
  const beats = [
    { x: 26, y: -196, on: smoothstep(.4, 1.6, t), period: 1.05, label: 'HEARTBEAT' },
    { x: -104, y: -70, on: smoothstep(2.4, 3.6, t), period: 2.1, label: 'MUSCLE RELEASE' },
    { x: 8, y: -330, on: smoothstep(4.6, 5.8, t), period: 1.5, label: 'NERVE QUIET' },
  ];
  beats.forEach((b, i) => {
    const f = b.on * (.35 + .65 * pulse(t + i * .3, b.period, 7));
    glow(ctx, b.x, b.y, 150, i === 1 ? P.amber : P.teal, .42 * f);
    blobPath(ctx, b.x, b.y, 30, .07, t + i, i * 4, 6);
    ctx.fillStyle = hexA(i === 1 ? P.amber : P.teal, .35 + .45 * f); ctx.fill();
  });

  // the supply: too few ions drifting, and thinning as the block runs
  const scarce = 1 - smoothstep(5.6, 9.4, t) * .55;
  for (let i = 0; i < 16; i++) {
    const ph = ((t * .12 + rnd(i)) % 1);
    const x = lerp(-150, 150, rnd(i + 30)) + Math.sin(t * .6 + i) * 26;
    const y = lerp(260, -300, ph);
    ctx.globalAlpha = scarce * (1 - Math.abs(ph - .5) * 1.3);
    ion(ctx, x, y, 8, P.teal, t, i, false);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  label(ctx, W * .17, H * .26, W / 2 + 26, H / 2 - 166, 'MAGNESIUM', smoothstep(6.4, 7.8, t), P.teal);
  vignette(ctx, W, H, .78); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 2. where the 25 grams actually sit ---------- */
function scene2(ctx, t, W, H) {
  bg(ctx, W, H, '#221545', '#070412');

  ctx.save();
  ctx.translate(W * .34, H / 2 + 30);
  ctx.scale(1.02, 1.02);
  paper(ctx, () => figurePath(ctx, 0), hexA(P.cream, .10), .28, 8, 12);
  strokePath(ctx, () => figurePath(ctx, 0), hexA(P.cream, .34), 3);

  // bone reservoir fills first and dominates
  const bone = smoothstep(.6, 3.4, t);
  ctx.save();
  ctx.beginPath(); figurePath(ctx, 0); ctx.clip();
  ctx.globalAlpha = bone;
  ctx.strokeStyle = hexA(P.teal, .75); ctx.lineWidth = 26; ctx.lineCap = 'round';
  [[-58, -250, -58, 30], [58, -250, 58, 30], [0, -300, 0, -40],
   [-46, 60, -60, 400], [46, 60, 60, 400]].forEach(s => {
    ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // muscle next, dimmer
  const mus = smoothstep(3.6, 5.6, t);
  ctx.fillStyle = hexA(P.teal, .22 * mus);
  ctx.fillRect(-150, -260, 300, 420);

  // and a very thin line of blood — the part we actually measure
  const blood = smoothstep(6.0, 7.6, t);
  ctx.strokeStyle = hexA(P.teal, .95 * blood); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-8, -300); ctx.lineTo(2, 300); ctx.stroke();
  ctx.restore();
  ctx.restore();

  // proportional bars, so the asymmetry is a quantity and not a vibe
  const rows = [
    { p: .60, n: 'BONE', s: .6 },
    { p: .27, n: 'MUSCLE', s: 3.6 },
    { p: .01, n: 'BLOOD  (WHERE IT IS MEASURED)', s: 6.0 },
  ];
  const bx = W * .60, bw = W * .30;
  rows.forEach((r, i) => {
    const a = smoothstep(r.s, r.s + 1.4, t);
    const y = H * .34 + i * 132;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = hexA(P.cream, .28); ctx.lineWidth = 2;
    ctx.strokeRect(bx, y, bw, 54);
    ctx.fillStyle = hexA(P.teal, .8);
    ctx.fillRect(bx + 2, y + 2, Math.max(4, bw * r.p - 4), 50);
    ctx.fillStyle = P.cream;
    ctx.font = '500 24px "DejaVu Sans", Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText(r.n, bx, y - 12);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(r.p * 100)}%`, bx + bw, y - 12);
    ctx.restore();
  });

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 3. the cofactor: ATP only works magnesium-bound ---------- */
function scene3(ctx, t, W, H) {
  bg(ctx, W, H, '#15234A', '#060411');

  // enzymes waiting in the background, firing once ATP becomes usable
  const mg = smoothstep(2.2, 4.4, t);
  const fire = smoothstep(5.6, 7.0, t) * (1 - smoothstep(8.4, 9.6, t));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU + t * .05;
    const x = W * .5 + Math.cos(a) * (W * .38), y = H * .5 + Math.sin(a) * (H * .40);
    const f = mg * (.3 + .7 * pulse(t + i * .21, 1.7, 8));
    glow(ctx, x, y, 110, P.gold, .45 * f);
    blobPath(ctx, x, y, 30, .07, t + i, i * 3, 6);
    ctx.fillStyle = hexA(P.gold, .30 + .55 * f); ctx.fill();
    ctx.strokeStyle = hexA(P.cream, .35); ctx.lineWidth = 2.5; ctx.stroke();
  }

  const s = lerp(2.3, 1.75, smoothstep(0, 4, t));
  ctx.save();
  ctx.translate(W * .47, H * .5);
  ctx.scale(s, s);
  atp(ctx, 0, 0, 1, mg, fire, t, 3);
  ctx.restore();

  label(ctx, W * .10, H * .24, W * .47 - 104 * s, H * .5, 'ATP', smoothstep(1.0, 2.2, t), P.gold);
  label(ctx, W * .90, H * .78, W * .47 + 78 * s, H * .5 + 54 * s, 'Mg-BOUND  =  USABLE', mg, P.teal, 24);
  label(ctx, W * .84, H * .12, W * .74, H * .22, '300+ ENZYME REACTIONS', smoothstep(7.2, 8.6, t), P.gold, 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 4. the cheap form barely dissolves ---------- */
function scene4(ctx, t, W, H) {
  bg(ctx, W, H, '#2A1A3E', '#0A0614');

  const wallY = H * .62;
  ctx.fillStyle = hexA('#150C22', .6);
  ctx.fillRect(0, 0, W, wallY - 110);

  // chalky undissolved oxide, tumbling through and mostly staying whole
  for (let i = 0; i < 13; i++) {
    const x = (rrange(i, -300, W) + t * rrange(i + 4, 26, 52)) % (W + 460) - 200;
    const y = rrange(i + 60, 90, wallY - 210);
    const r = rrange(i + 12, 34, 68);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t * rrange(i + 8, -.25, .25) + rnd(i) * TAU);
    blobPath(ctx, 0, 0, r, .13, i, i, 7);
    ctx.fillStyle = hexA(P.chalk, .72); ctx.fill();
    ctx.strokeStyle = hexA('#8A7F70', .6); ctx.lineWidth = 3; ctx.stroke();
    // a faint scatter of ions escaping the surface — not many
    ctx.restore();
    for (let k = 0; k < 2; k++) {
      const ph = ((t * .25 + k / 2 + rnd(i + k)) % 1);
      ctx.globalAlpha = (1 - ph) * .7;
      ion(ctx, x + Math.cos(k * 2.4 + i) * (r + ph * 90), y + Math.sin(k * 2.4 + i) * (r + ph * 90), 7, P.teal, t, i + k, false);
      ctx.globalAlpha = 1;
    }
  }

  gutWall(ctx, W, H, wallY, t, hexA('#B8536B', .95));

  // the few that make it through
  const crossed = smoothstep(2.0, 8.0, t);
  for (let i = 0; i < 5; i++) {
    const ph = ((t * .17 + i / 5) % 1);
    ctx.globalAlpha = crossed * (ph < .5 ? ph * 2 : 1);
    ion(ctx, W * (.12 + i * .19), wallY + 40 + ph * 260, 9, P.teal, t, i, false);
    ctx.globalAlpha = 1;
  }

  label(ctx, W * .16, H * .14, W * .30, H * .28, 'MAGNESIUM OXIDE  —  POORLY SOLUBLE', smoothstep(1.6, 3.0, t), P.chalk, 24);
  label(ctx, W * .88, H * .90, W * .5, wallY + 190, 'ONLY A SMALL FRACTION ABSORBED', smoothstep(5.0, 6.4, t), P.teal, 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 5. osmosis: what stays behind pulls water in ---------- */
function scene5(ctx, t, W, H) {
  bg(ctx, W, H, '#2E1636', '#0B0512');

  const draw = smoothstep(1.0, 5.4, t);
  const distress = smoothstep(5.6, 8.6, t);

  // lumen boundary distending as water arrives
  const bulge = 1 + draw * .3;
  ctx.save();
  ctx.translate(W * .5, H * .5);
  const lumen = () => {
    ctx.beginPath();
    ctx.ellipse(0, 0, W * .30 * bulge, H * .28 * bulge, 0, 0, TAU);
  };
  paper(ctx, lumen, hexA('#5A2038', .8), .35, 5, 8);
  strokePath(ctx, lumen, hexA('#B8536B', .85), 6);
  ctx.restore();

  // unabsorbed mineral sitting in the lumen, the osmotic load
  for (let i = 0; i < 16; i++) {
    const a = rrange(i, 0, TAU), rr = rrange(i + 5, 0, 1) ** .5;
    const x = W * .5 + Math.cos(a) * rr * W * .22 * bulge;
    const y = H * .5 + Math.sin(a) * rr * H * .19 * bulge;
    blobPath(ctx, x, y, rrange(i + 9, 15, 30), .1, t * .4 + i, i, 6);
    ctx.fillStyle = hexA(P.chalk, .6); ctx.fill();
  }

  // water dragged inward from the tissue
  for (let i = 0; i < 40; i++) {
    const a = rrange(i, 0, TAU);
    const ph = ((t * .22 + rnd(i + 3)) % 1);
    const d = lerp(W * .52, W * .17, ph);
    water(ctx, W * .5 + Math.cos(a) * d, H * .5 + Math.sin(a) * d * .72,
      9, a, draw * (ph < .12 ? ph / .12 : 1) * .9);
  }

  // distress ripple once the bowel is loaded
  if (distress > .01) {
    for (let r = 0; r < 4; r++) {
      const ph = ((t * .5 + r / 4) % 1);
      ctx.strokeStyle = hexA(P.acid, distress * (1 - ph) * .5);
      ctx.lineWidth = 12 * (1 - ph) + 3;
      ctx.beginPath(); ctx.ellipse(W * .5, H * .5, ph * W * .55, ph * H * .5, 0, 0, TAU); ctx.stroke();
    }
  }

  label(ctx, W * .12, H * .16, W * .30, H * .34, 'UNABSORBED MINERAL', smoothstep(1.4, 2.8, t), P.chalk, 24);
  label(ctx, W * .90, H * .84, W * .70, H * .62, 'WATER DRAWN IN  —  OSMOSIS', draw, '#7FC3E8', 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 6. the chelate closes ---------- */
function scene6(ctx, t, W, H) {
  bg(ctx, W, H, '#1B1440', '#070512');
  motes(ctx, W, H, t, 34, P.lav, .16);

  const close = smoothstep(1.6, 6.4, t);
  const s = lerp(4.0, 3.1, smoothstep(1.0, 7.0, t));
  const gapNow = lerp(210, 74, easeInOut(close)) * s;   // where the glycines actually are

  glow(ctx, W * .5, H * .48, 560, P.lav, .18 + .14 * close);
  chelate(ctx, W * .5, H * .48, s, close, t, 4);

  label(ctx, W * .10, H * .20, W * .5 - gapNow, H * .48, 'GLYCINE', smoothstep(.6, 2.0, t), P.lav);
  label(ctx, W * .90, H * .20, W * .5 + gapNow, H * .48, 'GLYCINE', smoothstep(.6, 2.0, t), P.lav);
  label(ctx, W * .5, H * .86, W * .5, H * .48 + 30 * s, 'MAGNESIUM ION', smoothstep(2.4, 3.8, t), P.teal, 24);
  label(ctx, W * .5, H * .10, W * .5, H * .48 - 66 * s, 'NEUTRAL, STABLE CHELATE', smoothstep(6.6, 8.2, t), P.cream, 24);

  vignette(ctx, W, H, .76); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 7. two doors: the congested mineral channel vs the amino-acid route ---------- */
function scene7(ctx, t, W, H) {
  bg(ctx, W, H, '#241748', '#080513');

  const wallY = H * .52;
  membrane(ctx, 0, W, wallY, P.cream, .55);

  const showL = smoothstep(.6, 2.2, t);
  const showR = smoothstep(3.4, 5.0, t);

  // LEFT: saturable mineral channel, with a queue that never clears
  const lx = W * .27;
  ctx.save(); ctx.globalAlpha = showL;
  channel(ctx, lx, wallY, 1.6, P.teal, .18, t, 1);
  // a jostling crowd rather than a grid — the point is congestion, not a queue
  for (let i = 0; i < 15; i++) {
    const bx = lx + rrange(i, -180, 180) + Math.sin(t * 1.8 + i) * 9;
    const by = wallY - 110 - rrange(i + 40, 0, 200) + Math.cos(t * 1.5 + i * 1.7) * 8;
    ion(ctx, bx, by, 15, P.teal, t, i, false);
  }
  // only a trickle emerges below
  for (let i = 0; i < 2; i++) {
    const ph = ((t * .3 + i / 2) % 1);
    ctx.globalAlpha = showL * (1 - ph);
    ion(ctx, lx + Math.sin(ph * 5 + i) * 20, wallY + 40 + ph * 240, 13, P.teal, t, i, false);
    ctx.globalAlpha = showL;
  }
  ctx.restore();

  // RIGHT: amino-acid route, flowing freely, carrying the whole chelate
  const rx = W * .72;
  ctx.save(); ctx.globalAlpha = showR;
  channel(ctx, rx, wallY, 1.25, P.lav, .9, t, 2);
  for (let i = 0; i < 5; i++) {
    const ph = ((t * .34 + i / 5) % 1);
    const y = lerp(wallY - 250, wallY + 290, ph);
    const sc = .30 + .06 * Math.sin(ph * 6);
    ctx.globalAlpha = showR * (ph < .1 ? ph * 10 : ph > .9 ? (1 - ph) * 10 : 1);
    chelate(ctx, rx + Math.sin(ph * 4 + i) * 18, y, sc, 1, t, i + 6);
  }
  ctx.restore();

  ctx.globalAlpha = 1;
  label(ctx, W * .06, H * .12, lx, wallY - 150, 'MINERAL CHANNEL  —  SATURABLE', showL, P.teal, 24);
  label(ctx, W * .95, H * .12, rx, wallY - 150, 'AMINO-ACID ROUTE', showR, P.lav, 24);
  label(ctx, W * .06, H * .90, lx, wallY + 200, 'CONGESTED', smoothstep(6.2, 7.4, t), P.acid, 24);
  label(ctx, W * .95, H * .90, rx, wallY + 200, 'FLOWING', smoothstep(6.2, 7.4, t), P.lav, 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 8. the package comes apart in the blood ---------- */
function scene8(ctx, t, W, H) {
  bg(ctx, W, H, '#3A1330', '#0C0512');

  // vessel
  ctx.fillStyle = hexA('#5E1B2E', .5);
  ctx.fillRect(0, H * .22, W, H * .56);
  ctx.strokeStyle = hexA('#A83048', .7); ctx.lineWidth = 5;
  [H * .22, H * .78].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); });
  for (let i = 0; i < 10; i++) {
    const x = (rrange(i, -300, W) + t * 70) % (W + 400) - 200;
    ctx.save(); ctx.translate(x, lerp(H * .28, H * .72, rnd(i + 3))); ctx.rotate(t * .2 + i);
    ctx.fillStyle = hexA('#B03248', .35);
    ctx.beginPath(); ctx.ellipse(0, 0, 40, 27, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  const split = smoothstep(3.2, 5.6, t);
  const travel = smoothstep(5.2, 9.4, t);

  // the chelate arrives, then separates
  const cx = lerp(W * .16, W * .46, smoothstep(0, 3.4, t));
  if (split < .99) chelate(ctx, cx, H * .5, .8 * (1 - split * .35), 1 - split, t, 4);

  if (split > .02) {
    // magnesium continues to muscle and bone
    const mx = lerp(W * .46, W * .90, travel);
    const my = lerp(H * .5, H * .30, travel);
    ion(ctx, mx, my, 28 * (.7 + .3 * split), P.teal, t, 2, false);
    ctx.strokeStyle = hexA(P.teal, .3 * split); ctx.lineWidth = 3; ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.moveTo(W * .46, H * .5); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);

    // glycine goes free
    const gx = lerp(W * .46, W * .88, travel);
    const gy = lerp(H * .5, H * .72, travel);
    glycine(ctx, gx, gy, .95, Math.sin(t) * .3, P.lav, t, 7);
    ctx.strokeStyle = hexA(P.lav, .3 * split); ctx.lineWidth = 3; ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.moveTo(W * .46, H * .5); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]);
  }

  label(ctx, W * .90, H * .14, W * .82, H * .32, 'MAGNESIUM  →  MUSCLE & BONE', smoothstep(6.0, 7.4, t), P.teal, 24);
  label(ctx, W * .90, H * .90, W * .82, H * .72, 'GLYCINE  →  RELEASED FREE', smoothstep(7.0, 8.4, t), P.lav, 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 9. muscle: calcium contracts, magnesium permits release ---------- */
function scene9(ctx, t, W, H) {
  bg(ctx, W, H, '#3A2016', '#0B0510');

  // calcium floods first, then magnesium-powered pumps withdraw it
  const flood = smoothstep(1.0, 3.4, t);
  const pump = smoothstep(4.6, 8.4, t);
  const contract = flood * (1 - pump);

  sarcomere(ctx, W * .46, H * .46, W * .56, H * .34, contract, t);

  // free calcium in the cytosol
  for (let i = 0; i < 26; i++) {
    const a = rrange(i, 0, TAU), rr = rrange(i + 4, 0, 1) ** .5;
    const free = flood * (1 - pump);
    ctx.globalAlpha = free;
    ion(ctx, W * .46 + Math.cos(a) * rr * W * .26,
        H * .46 + Math.sin(a) * rr * H * .22 + Math.sin(t * 2 + i) * 8,
        10, P.amber, t, i, false);
    ctx.globalAlpha = 1;
  }

  // the pumps along the sarcoplasmic reticulum, running on Mg
  const py = H * .80;
  ctx.strokeStyle = hexA(P.cream, .3); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(W * .12, py); ctx.lineTo(W * .84, py); ctx.stroke();
  for (let k = 0; k < 5; k++) {
    const px = W * (.20 + k * .13);
    const run = pump * (.4 + .6 * pulse(t + k * .3, 1.1, 8));
    glow(ctx, px, py, 110, P.teal, .4 * run);
    channel(ctx, px, py, .8, P.teal, .3 + .5 * run, t, k);
    ion(ctx, px, py - 40, 11, P.teal, t, k + 20, false);
    // calcium being hauled down through the pump
    for (let m = 0; m < 2; m++) {
      const ph = ((t * .7 + m / 2 + k * .2) % 1);
      ctx.globalAlpha = pump * (1 - ph);
      ion(ctx, px, py - 130 + ph * 190, 9, P.amber, t, m, false);
      ctx.globalAlpha = 1;
    }
  }

  label(ctx, W * .10, H * .16, W * .30, H * .34, 'CALCIUM  →  CONTRACT', flood * (1 - pump * .6), P.amber, 24);
  label(ctx, W * .93, H * .60, W * .60, py - 50, 'Mg-POWERED PUMPS  →  RELEASE', pump, P.teal, 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 10. the NMDA receptor plug ---------- */
function scene10(ctx, t, W, H) {
  bg(ctx, W, H, '#16123C', '#060412');

  const memY = H * .54;
  membrane(ctx, 0, W, memY, P.cream, .5);

  const seated = smoothstep(1.2, 3.6, t) * (1 - smoothstep(6.0, 7.2, t));
  const overfire = smoothstep(7.2, 9.0, t);

  // the receptor, wide open in principle
  channel(ctx, W * .42, memY, 2.1, '#E8DFC8', .85, t, 3);

  // magnesium seated in the pore, blocking it
  if (seated > .01) {
    glow(ctx, W * .42, memY, 230, P.teal, .6 * seated);
    ion(ctx, W * .42, memY, 34, P.teal, t, 5, false);
  }

  // calcium massed above, pressing against a door it cannot use
  for (let i = 0; i < 14; i++) {
    const x = W * .42 + rrange(i, -230, 230) + Math.sin(t * 2.1 + i) * 10;
    const y = memY - 120 - rrange(i + 30, 0, 170) + Math.cos(t * 2.4 + i * 1.3) * 12;
    ion(ctx, x, y, 13, P.amber, t, i, false);
  }

  // blocked: nothing below. unblocked: calcium pours in and the neuron overfires
  if (overfire > .01) {
    for (let i = 0; i < 20; i++) {
      const ph = ((t * .9 + i / 20) % 1);
      ctx.globalAlpha = overfire * (1 - ph);
      ion(ctx, W * .42 + Math.sin(ph * 6 + i) * 90, memY + 30 + ph * 320, 11, P.amber, t, i, false);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = hexA(P.acid, overfire * .07 * (.5 + .5 * Math.sin(t * 9)));
    ctx.fillRect(0, 0, W, H);
  }

  // a neuron downstream, calm then agitated
  neuron(ctx, W * .80, H * .78, 34, -1.4,
    overfire > .3 ? P.acid : P.teal,
    (seated * .5 + overfire * (.5 + .5 * pulse(t, .32, 9))), t, 9, overfire);

  label(ctx, W * .07, H * .20, W * .42 - 60, memY - 40, 'NMDA RECEPTOR', smoothstep(.6, 2.0, t), P.cream, 24);
  label(ctx, W * .93, H * .24, W * .42 + 40, memY + 6, 'Mg²⁺  BLOCKS THE PORE', seated, P.teal, 24);
  label(ctx, W * .93, H * .92, W * .70, H * .74, 'LOW Mg  →  OVERFIRING', overfire, P.acid, 24);

  vignette(ctx, W, H, .74); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 11. glycine's own inhibitory job ---------- */
function scene11(ctx, t, W, H) {
  bg(ctx, W, H, '#1D1440', '#070512');

  const memY = H * .44;
  membrane(ctx, 0, W, memY, P.cream, .45);

  const bind = smoothstep(.8, 2.8, t);
  const open = smoothstep(2.8, 5.0, t);
  const quiet = smoothstep(5.0, 8.0, t);

  // glycine arriving at its receptor
  const gx = lerp(W * .10, W * .34, bind);
  glycine(ctx, gx, memY - 130, .9, Math.sin(t * .8) * .25, P.lav, t, 3);
  channel(ctx, W * .34, memY, 1.7, P.lav, open, t, 4);
  glow(ctx, W * .34, memY, 220, P.lav, .35 * open);

  // chloride pouring in, hyperpolarising the cell
  for (let i = 0; i < 18; i++) {
    const ph = ((t * .8 + i / 18) % 1);
    ctx.globalAlpha = open * (1 - ph * .8);
    const x = W * .34 + Math.sin(ph * 5 + i) * 70;
    ctx.fillStyle = hexA('#8FD3E8', .85);
    ctx.beginPath(); ctx.arc(x, memY + 20 + ph * 300, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = hexA('#FFFFFF', .8);
    ctx.font = '600 15px "DejaVu Sans", Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('−', x, memY + 20 + ph * 300);
    ctx.globalAlpha = 1;
  }

  // the neuron going quiet
  neuron(ctx, W * .70, H * .74, 36, -1.2,
    quiet > .5 ? P.lavDeep : P.lav,
    (1 - quiet) * (.4 + .6 * pulse(t, .5, 9)), t, 11, (1 - quiet) * .5);

  // core temperature falling before sleep
  const showT = smoothstep(6.2, 7.8, t);
  if (showT > .01) {
    const gx0 = W * .06, gw = W * .34, gy = H * .93, gh = 150;
    ctx.save(); ctx.globalAlpha = showT;
    ctx.strokeStyle = hexA(P.cream, .3); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx0 + gw, gy); ctx.stroke();
    ctx.strokeStyle = hexA('#8FD3E8', .9); ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const u = i / 200;
      ctx.lineTo(gx0 + u * gw, gy - gh * (1 - smoothstep(.25, .85, u) * .75) * .8);
    }
    ctx.stroke();
    ctx.fillStyle = hexA(P.cream, .8);
    ctx.font = '500 22px "DejaVu Sans", Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('CORE BODY TEMPERATURE', gx0, gy - gh - 14);
    ctx.restore();
  }

  label(ctx, W * .95, H * .12, W * .34, memY - 60, 'GLYCINE RECEPTOR  —  CHLORIDE CHANNEL', open, P.lav, 24);
  label(ctx, W * .95, H * .62, W * .70, H * .70, 'NEURON QUIETED', quiet, P.lav, 24);

  vignette(ctx, W, H, .76); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

/* ---------- 12. two effects, arriving together ---------- */
function scene12(ctx, t, W, H) {
  bg(ctx, W, H, '#1E1442', '#080512');
  motes(ctx, W, H, t, 44, P.lav, .14);

  const pull = easeInOut(clamp(t / 6.5, 0, 1));
  ctx.save();
  ctx.translate(W / 2, H / 2 + 30);
  ctx.scale(lerp(1.04, .86, pull), lerp(1.04, .86, pull));

  glow(ctx, 0, 20, 340, P.teal, .13);
  glow(ctx, 0, 20, 300, P.lav, .11);
  paper(ctx, () => figurePath(ctx, 0), hexA(P.cream, .13), .28, 8, 12);
  strokePath(ctx, () => figurePath(ctx, 0), hexA(P.cream, .42), 3);

  // the two settle through the body in one shared rhythm
  const breathe = .5 + .5 * Math.sin(t * .85);
  ctx.save();
  ctx.beginPath(); figurePath(ctx, 0); ctx.clip();
  for (let i = 0; i < 26; i++) {
    const ph = ((t * .075 + rnd(i)) % 1);
    const x = lerp(-140, 140, rnd(i + 12)) + Math.sin(t * .5 + i) * 20;
    const y = lerp(-380, 380, ph);
    const teal = i % 2 === 0;
    ctx.globalAlpha = .30 + .5 * (1 - Math.abs(ph - .5) * 2) * (.6 + .4 * breathe);
    if (teal) ion(ctx, x, y, 10, P.teal, t, i, false);
    else glycine(ctx, x, y, .34, i, P.lav, t, i);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.restore();

  // the two-in-one statement
  const show = smoothstep(3.4, 6.2, t);
  if (show > .01) {
    ctx.save(); ctx.globalAlpha = show;
    const cx = W * .82, cy = H * .5;
    [[cy - 82, P.teal, 'MAGNESIUM', 'lets cells rest'],
     [cy + 82, P.lav, 'GLYCINE', 'does the same']].forEach(([y, col, a, b]) => {
      glow(ctx, cx - 120, y, 90, col, .45);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx - 120, y, 20, 0, TAU); ctx.fill();
      ctx.fillStyle = P.cream;
      ctx.font = '600 32px "DejaVu Sans", Arial, sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(a, cx - 80, y - 2);
      ctx.fillStyle = hexA(P.cream, .7);
      ctx.font = '400 24px "DejaVu Sans", Arial, sans-serif';
      ctx.fillText(b, cx - 80, y + 32);
    });
    ctx.strokeStyle = hexA(P.cream, .3); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 120, cy - 52); ctx.lineTo(cx - 120, cy + 52); ctx.stroke();
    ctx.restore();
  }

  vignette(ctx, W, H, .8); grain(ctx, W, H, .1, document); seams(ctx, W, H, t, DUR);
}

const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12];
