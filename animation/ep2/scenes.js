/* Episode 2 — the twelve 10-second blocks. Each scene is a pure function of t. */

const DUR = 10;

/* floating dust/plasma motes, used as connective tissue between scenes */
function motes(ctx, W, H, t, n, color, alpha) {
  for (let i = 0; i < n; i++) {
    const x = (rrange(i, 0, W) + t * rrange(i + 500, -14, 14) + W) % W;
    const y = (rrange(i + 90, 0, H) + t * rrange(i + 700, -20, -4) + H * 2) % H;
    const r = rrange(i + 40, 1.2, 3.6);
    ctx.fillStyle = hexA(color, alpha * (.3 + .7 * Math.abs(Math.sin(t * .6 + i))));
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
}

/* ---------- 1. the body, and the decision being made inside it ---------- */
function scene1(ctx, t, W, H) {
  bg(ctx, W, H, '#3A1020', '#150610');
  const z = lerp(0.86, 1.02, easeInOut(t / DUR));
  motes(ctx, W, H, t, 60, P.gold, .22);

  ctx.save();
  ctx.translate(W / 2, H / 2 + 30);
  ctx.scale(z, z);

  glow(ctx, 0, 40, 340, P.crimson, .35);
  paper(ctx, () => figurePath(ctx, 0), hexA(P.cream, .13), .28, 8, 12);
  strokePath(ctx, () => figurePath(ctx, 0), hexA(P.cream, .42), 3);

  // gut, the source of the signal
  ctx.save();
  ctx.translate(0, -30);
  const beat = .55 + .45 * Math.pow(pulse(t, 1.6, 7), 1.2);
  glow(ctx, 0, 58, 190, P.gold, .30 * beat);
  strokePath(ctx, () => intestinePath(ctx, t * .5), hexA(P.goldDeep, .85), 21);
  strokePath(ctx, () => intestinePath(ctx, t * .5), hexA(P.gold, .5 + .5 * beat), 13);
  ctx.restore();

  // faint gut-brain axis, foreshadowing the whole episode
  const axis = [[0, 20], [-6, -110], [4, -230], [0, -360]];
  ctx.globalAlpha = smoothstep(4.5, 8, t) * .5;
  strokePath(ctx, () => curve(ctx, axis), hexA(P.teal, .5), 4);
  pulsesAlong(ctx, axis, t, .1, 2, P.gold, 5, .2);
  ctx.globalAlpha = 1;
  ctx.restore();

  vignette(ctx, W, H, .78);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 2. L-cells and K-cells release the incretins ---------- */
function scene2(ctx, t, W, H) {
  bg(ctx, W, H, '#4A1424', '#1A0710');
  const z = lerp(1.06, .96, easeInOut(t / DUR));
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(z, z);
  ctx.translate(-W / 2, -H / 2);

  const wallY = H * .46;
  // lumen above the wall, with food drifting through
  ctx.fillStyle = hexA(P.crimDark, .55);
  ctx.fillRect(0, 0, W, wallY - 120);
  for (let i = 0; i < 26; i++) {
    const x = (rrange(i, -200, W) + t * rrange(i + 3, 40, 90)) % (W + 300) - 100;
    const y = rrange(i + 60, 60, wallY - 170);
    const r = rrange(i + 11, 9, 26);
    ctx.fillStyle = hexA(P.gold, .30);
    blobPath(ctx, x, y, r, .06, t + i, i, 6); ctx.fill();
  }

  // epithelial wall with villi
  ctx.save();
  const villiPath = () => {
    ctx.beginPath();
    ctx.moveTo(-50, H);
    ctx.lineTo(-50, wallY);
    for (let x = -50; x <= W + 50; x += 8) {
      const u = x / 96;
      const h = 110 + Math.sin(u * 1.7) * 26;
      const y = wallY - Math.pow(Math.abs(Math.sin(u * Math.PI / 2 + Math.sin(x * .01 + t * .3) * .1)), .55) * h;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 50, H);
    ctx.closePath();
  };
  paper(ctx, villiPath, hexA('#C2566A', .92), .4, 5, 9);
  ctx.restore();

  // enteroendocrine cells embedded in the wall
  const cells = [
    { x: W * .22, y: wallY + 70, type: 'L' }, { x: W * .40, y: wallY + 108, type: 'K' },
    { x: W * .58, y: wallY + 66, type: 'L' }, { x: W * .76, y: wallY + 112, type: 'K' },
    { x: W * .89, y: wallY + 74, type: 'L' },
  ];
  cells.forEach((c, i) => {
    const fire = pulse(t + i * .37, 1.9, 8);
    const col = c.type === 'L' ? P.teal : P.gold;
    glow(ctx, c.x, c.y, 120, col, .34 * (.3 + fire));
    blobPath(ctx, c.x, c.y, 40, .08, t + i, i * 3, 6);
    ctx.fillStyle = hexA(col, .55 + .35 * fire); ctx.fill();
    ctx.strokeStyle = hexA(P.cream, .5); ctx.lineWidth = 2.5; ctx.stroke();

    // hormone granules released downward into the capillary bed
    for (let k = 0; k < 7; k++) {
      const ph = ((t * .34 + k / 7 + i * .2) % 1);
      const yy = c.y + ph * 250;
      const a = (1 - ph) * smoothstep(0, .1, ph) * .95;
      ctx.fillStyle = hexA(col, a);
      ctx.beginPath();
      ctx.arc(c.x + Math.sin(ph * 7 + k) * 22, yy, 7 - ph * 3, 0, TAU);
      ctx.fill();
    }
  });

  // capillary bed carrying the hormones away
  ctx.fillStyle = hexA(P.crimDeep, .5);
  ctx.fillRect(0, wallY + 300, W, 130);
  ctx.strokeStyle = hexA(P.crimson, .7); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, wallY + 300); ctx.lineTo(W, wallY + 300); ctx.stroke();
  for (let i = 0; i < 30; i++) {
    const x = (rrange(i + 21, 0, W) + t * 130) % W;
    ctx.fillStyle = hexA(i % 3 ? P.teal : P.gold, .8);
    ctx.beginPath(); ctx.arc(x, wallY + 340 + rrange(i, 0, 50), 6, 0, TAU); ctx.fill();
  }
  ctx.restore();

  const la = smoothstep(2.6, 4.0, t);
  label(ctx, W * .10, H * .30, W * .22, H * .46 + 70, 'L-CELL  →  GLP-1', la, P.teal);
  label(ctx, W * .84, H * .22, W * .76, H * .46 + 112, 'K-CELL  →  GIP', smoothstep(4.2, 5.6, t), P.gold);

  vignette(ctx, W, H, .7);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 3. DPP-4 destroys native GLP-1 in ~2 minutes ---------- */
function scene3(ctx, t, W, H) {
  bg(ctx, W, H, '#4E1526', '#160610');

  // vessel tunnel walls
  ctx.save();
  const wall = (yTop, flip) => {
    ctx.beginPath();
    ctx.moveTo(-40, flip ? H + 40 : -40);
    for (let x = -40; x <= W + 40; x += 12)
      ctx.lineTo(x, yTop + Math.sin(x * .006 + (flip ? 2 : 0)) * 26);
    ctx.lineTo(W + 40, flip ? H + 40 : -40);
    ctx.closePath();
  };
  paper(ctx, () => wall(H * .16, false), hexA('#7B1F31', .95), .4, 0, 6);
  paper(ctx, () => wall(H * .86, true), hexA('#7B1F31', .95), .4, 0, -6);
  ctx.restore();

  // red blood cells drifting
  for (let i = 0; i < 16; i++) {
    const x = (rrange(i, -300, W) + t * rrange(i + 5, 90, 150)) % (W + 400) - 200;
    const y = lerp(H * .26, H * .78, rnd(i + 33));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rrange(i + 9, 0, TAU) + t * .3);
    ctx.fillStyle = hexA('#B03248', .5);
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 24, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // GLP-1 molecules travelling left→right, cleaved at the DPP-4 line
  const cutX = W * .54;
  for (let i = 0; i < 22; i++) {
    const speed = rrange(i + 2, 105, 155);
    const startX = -160 - rrange(i, 0, 1500);
    const x = startX + t * speed;
    if (x > W + 120) continue;
    const y = lerp(H * .28, H * .76, rnd(i + 71)) + Math.sin(t * 1.4 + i) * 14;
    if (x < cutX) {
      glow(ctx, x, y, 46, P.gold, .45);
      peptide(ctx, x - 34, y, 68, 9, t + i, 1, P.gold, 6);
    } else {
      // cleaved: two inert grey halves drifting apart and fading
      const d = (x - cutX) / 240;
      const a = clamp(1 - d, 0, 1) * .8;
      ctx.save(); ctx.globalAlpha = a;
      peptide(ctx, x - 34, y - d * 34, 30, 5, t + i, 1, P.grey, 5);
      peptide(ctx, x + 4, y + d * 34, 30, 5, t + i + 3, 1, P.grey, 5);
      ctx.restore();
    }
  }

  // the DPP-4 enzyme: angular shears sitting on the vessel wall
  const snap = pulse(t, .9, 9);
  for (let k = 0; k < 3; k++) {
    const ex = cutX + (k - 1) * 130, ey = k % 2 ? H * .27 : H * .74;
    const dir = k % 2 ? 1 : -1;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(dir * .5);
    glow(ctx, 0, 0, 90, '#D8D2C4', .18);
    ctx.strokeStyle = hexA('#E4DCCB', .92); ctx.lineWidth = 11; ctx.lineCap = 'round';
    const open = .30 + .34 * (1 - snap);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-open) * 96 * dir, Math.sin(-open) * 96);
    ctx.moveTo(0, 0); ctx.lineTo(Math.cos(open) * 96 * dir, Math.sin(open) * 96);
    ctx.stroke();
    ctx.fillStyle = '#E4DCCB';
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill();
    ctx.restore();
  }

  label(ctx, W * .54, H * .11, cutX, H * .27, 'DPP-4  —  CLEAVES GLP-1 IN ~2 MIN', smoothstep(2.2, 3.6, t), '#E4DCCB');
  vignette(ctx, W, H, .72);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 4. tirzepatide: one peptide, both receptors ---------- */
function scene4(ctx, t, W, H) {
  bg(ctx, W, H, '#123038', '#07161C');
  motes(ctx, W, H, t, 40, P.teal, .18);

  // phase A: the molecule assembles residue by residue
  const build = smoothstep(.3, 3.6, t);
  const travel = smoothstep(3.8, 5.6, t);
  const dock = smoothstep(5.8, 8.2, t);

  const mx = lerp(W * .5, W * .5, travel);
  const my = lerp(H * .40, H * .30, travel);

  ctx.save();
  const s = lerp(1.5, 1.05, travel);
  ctx.translate(mx, my); ctx.scale(s, s); ctx.translate(-mx, -my);
  glow(ctx, mx, my, 260 * (.4 + .6 * build), P.teal, .3);
  peptide(ctx, mx - 190, my, 380, 26, t, build, P.teal, 11);
  ctx.restore();

  // phase B: two receptors in the cell membrane, both lit by the same molecule
  membrane(ctx, 0, W, H * .72, P.cream, .5 + .4 * travel);
  const litG = dock * (.75 + .25 * Math.sin(t * 3));
  receptor(ctx, W * .30, H * .72, 1.5, P.teal, litG);
  receptor(ctx, W * .70, H * .72, 1.5, P.gold, litG);

  // the molecule reaches down into both pockets simultaneously
  if (dock > .01) {
    ctx.save();
    ctx.globalAlpha = dock;
    [[W * .30, P.teal], [W * .70, P.gold]].forEach(([rx, col]) => {
      ctx.strokeStyle = hexA(col, .8); ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mx, my + 20);
      ctx.quadraticCurveTo((mx + rx) / 2, H * .56, rx, H * .72 - 44);
      ctx.stroke();
      glow(ctx, rx, H * .72 - 30, 110, col, dock * .55);
    });
    ctx.restore();
    // downstream signal spreading below the membrane
    for (let i = 0; i < 22; i++) {
      const u = ((t * .5 + i / 22) % 1);
      const x = i % 2 ? W * .30 : W * .70;
      ctx.fillStyle = hexA(i % 2 ? P.teal : P.gold, (1 - u) * dock * .8);
      ctx.beginPath();
      ctx.arc(x + Math.sin(u * 8 + i) * 90 * u, H * .72 + 40 + u * 260, 6, 0, TAU);
      ctx.fill();
    }
  }

  label(ctx, W * .12, H * .84, W * .30, H * .72, 'GLP-1 RECEPTOR', dock, P.teal);
  label(ctx, W * .88, H * .84, W * .70, H * .72, 'GIP RECEPTOR', dock, P.gold);
  label(ctx, W * .5, H * .10, mx, my - 40, 'TIRZEPATIDE  —  DUAL AGONIST', smoothstep(2.0, 3.4, t) * (1 - smoothstep(8.6, 9.6, t)), P.cream);

  vignette(ctx, W, H, .74);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 5. weekly subcutaneous dose, ~5-day half-life ---------- */
function scene5(ctx, t, W, H) {
  bg(ctx, W, H, '#42172A', '#150711');

  // skin in cross-section: epidermis, dermis, subcutaneous fat
  const y0 = H * .10;
  const layers = [
    { h: 62, c: '#E6C9A8', n: 'EPIDERMIS' },
    { h: 150, c: '#C98F86', n: 'DERMIS' },
    { h: 300, c: '#8E4552', n: 'SUBCUTANEOUS FAT' },
  ];
  let yy = y0;
  layers.forEach((L, i) => {
    ctx.fillStyle = hexA(L.c, .9);
    ctx.beginPath();
    ctx.moveTo(0, yy);
    for (let x = 0; x <= W; x += 14) ctx.lineTo(x, yy + Math.sin(x * .012 + i) * 7);
    ctx.lineTo(W, yy + L.h); ctx.lineTo(0, yy + L.h);
    ctx.closePath(); ctx.fill();
    yy += L.h;
  });
  // fat lobules in the subcutaneous layer
  for (let i = 0; i < 26; i++) {
    const x = rrange(i, 40, W - 40), y = rrange(i + 50, y0 + 240, y0 + 470);
    adipocyte(ctx, x, y, rrange(i + 80, 26, 44), t, i, .8);
  }

  // the injector delivers a depot into the subcutaneous space
  const inject = smoothstep(.4, 1.8, t);
  const depotX = W * .30, depotY = y0 + 330;
  ctx.save();
  ctx.translate(depotX, y0 - 150 + inject * 120);
  ctx.fillStyle = hexA(P.cream, .95);
  ctx.fillRect(-34, -230, 68, 230);
  ctx.fillStyle = hexA(P.teal, .8);
  ctx.fillRect(-24, -190, 48, 120 * (1 - inject));
  ctx.strokeStyle = hexA(P.cream, .95); ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 210); ctx.stroke();
  ctx.restore();

  const spread = smoothstep(1.6, 4.2, t);
  glow(ctx, depotX, depotY, 60 + spread * 210, P.teal, .5 * spread);
  blobPath(ctx, depotX, depotY, 40 + spread * 120, .12, t * .6, 4, 7);
  ctx.fillStyle = hexA(P.teal, .3 * spread); ctx.fill();

  // capillary carrying the drug away, steadily
  const vy = y0 + 500;
  ctx.fillStyle = hexA(P.crimDeep, .8); ctx.fillRect(0, vy, W, 96);
  ctx.strokeStyle = hexA(P.crimson, .8); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, vy); ctx.lineTo(W, vy); ctx.stroke();
  const flow = [[0, vy + 48], [W, vy + 48]];
  if (spread > .1) pulsesAlong(ctx, flow, t, .16, 9, P.teal, 8, 0);

  // native vs drug plasma-level curves
  const gx = W * .08, gw = W * .84, gy = H * .93, gh = 190;
  ctx.strokeStyle = hexA(P.cream, .35); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
  const showG = smoothstep(4.4, 6.0, t);
  if (showG > .01) {
    ctx.save(); ctx.globalAlpha = showG;
    // native GLP-1: rapid spikes that collapse instantly
    ctx.strokeStyle = hexA(P.gold, .85); ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const u = i / 300, x = gx + u * gw;
      const sp = Math.pow(Math.max(0, Math.sin(u * TAU * 7)), 14);
      ctx.lineTo(x, gy - sp * gh * .8);
    }
    ctx.stroke();
    // tirzepatide: a high, flat plateau
    ctx.strokeStyle = hexA(P.teal, .95); ctx.lineWidth = 6;
    ctx.beginPath();
    for (let i = 0; i <= 300; i++) {
      const u = i / 300, x = gx + u * gw;
      const lv = smoothstep(0, .16, u) * (1 - u * .12) * (.72 + .04 * Math.sin(u * TAU * 3));
      ctx.lineTo(x, gy - lv * gh);
    }
    ctx.stroke();
    ctx.restore();
    label(ctx, gx + gw * .5, gy - gh - 34, gx + gw * .5, gy - gh * .72, 'HALF-LIFE ≈ 5 DAYS  —  ONCE WEEKLY', showG, P.teal, 24);
  }

  label(ctx, W * .93, y0 + 330, depotX + 130, depotY, 'SUBCUTANEOUS DEPOT', smoothstep(2.4, 3.6, t) * (1 - showG * .6), P.cream, 24);
  vignette(ctx, W, H, .7);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 6. pancreas: glucose-dependent insulin, glucagon suppressed ---------- */
function scene6(ctx, t, W, H) {
  bg(ctx, W, H, '#4A1A22', '#150710');

  // whole pancreas, then an islet of Langerhans pulled out of it
  const zoom = smoothstep(.6, 3.0, t);
  ctx.save();
  ctx.translate(W * .5, lerp(H * .5, H * .17, zoom));
  const ps = lerp(1.9, 1.18, zoom);
  ctx.scale(ps, ps);
  paper(ctx, () => pancreasPath(ctx), hexA('#D9A05B', .95), .4, 6, 10);
  strokePath(ctx, () => pancreasPath(ctx), hexA('#8A5A22', .8), 4);
  // islets scattered through the tissue
  for (let i = 0; i < 12; i++) {
    const x = rrange(i, -170, 165), y = rrange(i + 30, -34, 14);
    ctx.fillStyle = hexA(P.teal, .35 + .3 * pulse(t + i * .3, 2.2, 7));
    ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // the islet in close-up: beta core, alpha rim
  if (zoom > .1) {
    ctx.save();
    ctx.globalAlpha = zoom;
    const cx = W * .40, cy = H * .63, R = 262;
    glow(ctx, cx, cy, R * 1.7, P.teal, .22);
    blobPath(ctx, cx, cy, R, .05, t * .3, 2, 7);
    ctx.fillStyle = hexA('#6E2233', .92); ctx.fill();
    ctx.strokeStyle = hexA(P.cream, .3); ctx.lineWidth = 3; ctx.stroke();

    // glucose rises through the block; insulin release tracks it
    const glucose = smoothstep(3.2, 6.2, t) * (1 - smoothstep(8.8, 10, t) * .25);

    // beta cells (core) — fire only when glucose is high
    for (let i = 0; i < 13; i++) {
      const a = rrange(i, 0, TAU), rr = rrange(i + 5, 0, R * .58);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      const fire = glucose * (.45 + .55 * pulse(t + i * .21, 1.5, 8));
      glow(ctx, x, y, 96, P.teal, .5 * fire);
      blobPath(ctx, x, y, 34, .07, t + i, i, 6);
      ctx.fillStyle = hexA(P.teal, .35 + .5 * fire); ctx.fill();
      ctx.strokeStyle = hexA(P.cream, .35); ctx.lineWidth = 2; ctx.stroke();
      // insulin granules
      for (let k = 0; k < 4; k++) {
        const ph = ((t * .5 + k / 4 + i * .13) % 1);
        const ang = a + rrange(i + k, -.4, .4);
        const d = ph * 260;
        ctx.fillStyle = hexA(P.teal, (1 - ph) * glucose * .9);
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d, 6, 0, TAU);
        ctx.fill();
      }
    }
    // alpha cells (rim) — quietened as the drug acts
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + .2;
      const x = cx + Math.cos(a) * R * .84, y = cy + Math.sin(a) * R * .84;
      const quiet = 1 - glucose * .85;
      blobPath(ctx, x, y, 27, .07, t + i, i + 40, 6);
      ctx.fillStyle = hexA(P.crimson, .3 + .5 * quiet); ctx.fill();
      ctx.strokeStyle = hexA(P.cream, .2 + .2 * quiet); ctx.lineWidth = 2; ctx.stroke();
      for (let k = 0; k < 3; k++) {
        const ph = ((t * .4 + k / 3 + i * .2) % 1);
        ctx.fillStyle = hexA(P.crimson, (1 - ph) * quiet * .55);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * ph * 140, y + Math.sin(a) * ph * 140, 5, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();

    // glucose meter on the right — the gate that makes insulin release conditional
    const gx = W * .80, gy0 = H * .86, gh = 470, gw = 96;
    ctx.save(); ctx.globalAlpha = zoom;
    ctx.strokeStyle = hexA(P.cream, .4); ctx.lineWidth = 3;
    ctx.strokeRect(gx, gy0 - gh, gw, gh);
    const glucose2 = smoothstep(3.2, 6.2, t);
    ctx.fillStyle = hexA(P.gold, .8);
    ctx.fillRect(gx + 5, gy0 - gh * glucose2 + 3, gw - 10, gh * glucose2 - 6);
    for (let i = 0; i < 24; i++) {
      const yy = gy0 - rrange(i, 0, gh * glucose2);
      ctx.fillStyle = hexA(P.cream, .5);
      ctx.beginPath(); ctx.arc(gx + gw / 2 + Math.sin(t * 2 + i) * 24, yy, 5, 0, TAU); ctx.fill();
    }
    // the gate: insulin release is conditional on this level
    label(ctx, gx - 26, gy0 - gh - 34, gx + gw / 2, gy0 - gh + 24, 'BLOOD GLUCOSE', zoom, P.gold, 24);
    ctx.restore();

    label(ctx, W * .07, H * .34, W * .40 - 130, H * .63 - 90, 'BETA CELL  →  INSULIN', smoothstep(4.0, 5.4, t), P.teal);
    label(ctx, W * .07, H * .93, W * .40 - 190, H * .63 + 200, 'ALPHA CELL  —  GLUCAGON SUPPRESSED', smoothstep(6.4, 7.8, t), P.crimson, 24);
  }

  vignette(ctx, W, H, .72);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 7. delayed gastric emptying → sustained satiety signal ---------- */
function scene7(ctx, t, W, H) {
  bg(ctx, W, H, '#4A1626', '#160610');

  const fill = smoothstep(.5, 5.0, t);
  ctx.save();
  ctx.translate(W * .40, H * .52);
  ctx.scale(1.72, 1.72);

  // oesophagus arriving at the cardia
  ctx.strokeStyle = hexA('#A8455A', .9); ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-46, -300); ctx.lineTo(-30, -168); ctx.stroke();

  paper(ctx, () => stomachPath(ctx, fill), hexA('#C4566B', .95), .4, 5, 9);
  strokePath(ctx, () => stomachPath(ctx, fill), hexA('#7A2033', .85), 4);

  // rugae, the stomach's inner folds
  ctx.save();
  ctx.beginPath(); stomachPath(ctx, fill); ctx.clip();
  ctx.strokeStyle = hexA('#8E2A40', .45); ctx.lineWidth = 5;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    for (let x = -160; x <= 160; x += 10)
      ctx.lineTo(x, -150 + i * 36 + Math.sin(x * .045 + i + t * .5) * 10);
    ctx.stroke();
  }
  // contents accumulating, held back
  const n = 60;
  for (let i = 0; i < n * fill; i++) {
    const a = rrange(i, 0, TAU), rr = rrange(i + 7, 0, 1) ** .55 * 118;
    const x = Math.cos(a) * rr - 26, y = Math.sin(a) * rr * 1.1 + 40 + Math.sin(t * .7 + i) * 5;
    ctx.fillStyle = hexA(P.gold, .55);
    blobPath(ctx, x, y, rrange(i + 3, 10, 20), .07, t * .5 + i, i, 6); ctx.fill();
  }
  ctx.restore();

  // pyloric sphincter: nearly shut, only a trickle escapes
  const openness = lerp(.9, .10, smoothstep(2.0, 5.5, t));
  ctx.save();
  ctx.translate(164, 48);
  ctx.strokeStyle = hexA('#6E1B2C', .95); ctx.lineWidth = 22; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -52); ctx.lineTo(0, -14 - openness * 12);
  ctx.moveTo(0, 52); ctx.lineTo(0, 14 + openness * 12);
  ctx.stroke();
  // duodenum leading away
  ctx.strokeStyle = hexA('#B04E62', .8); ctx.lineWidth = 26;
  ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(90, 20, 118, 96); ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 5; i++) {
    const ph = ((t * .22 * openness + i / 5) % 1);
    ctx.fillStyle = hexA(P.gold, (1 - ph) * .7 * openness);
    ctx.beginPath(); ctx.arc(176 + ph * 110, 48 + ph * 70, 9, 0, TAU); ctx.fill();
  }
  ctx.restore();

  // vagal afferents: stretch reported upward, continuously
  const vag = [[W * .50, H * .34], [W * .58, H * .22], [W * .60, H * .08], [W * .62, -40]];
  strokePath(ctx, () => curve(ctx, vag), hexA(P.cream, .35), 12);
  strokePath(ctx, () => curve(ctx, vag), hexA(P.gold, .5), 5);
  if (fill > .25) pulsesAlong(ctx, vag, t, .30, 4, P.gold, 9, 0);

  label(ctx, W * .80, H * .40, W * .40 + 282, H * .52 + 83, 'PYLORUS  —  EMPTYING SLOWED', smoothstep(3.0, 4.4, t), P.cream, 24);
  label(ctx, W * .78, H * .82, W * .40 - 206, H * .52 + 206, 'STRETCH RECEPTORS  →  "STILL FULL"', smoothstep(5.6, 7.0, t), P.gold, 24);
  label(ctx, W * .84, H * .10, W * .60, H * .12, 'VAGUS NERVE', smoothstep(7.4, 8.6, t), P.cream, 24);

  vignette(ctx, W, H, .72);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 8. up the vagus into the hypothalamus, to the arcuate nucleus ---------- */
function scene8(ctx, t, W, H) {
  bg(ctx, W, H, '#161033', '#070512');

  // the camera climbs, then the brain settles into frame
  const climb = smoothstep(0, 3.4, t);
  const zoom = smoothstep(4.2, 8.6, t);

  ctx.save();
  ctx.translate(W * .5, H * .52 + (1 - climb) * H * .6);

  // nerve fibres streaming past during the climb
  ctx.save();
  ctx.globalAlpha = (1 - zoom) * .9;
  for (let i = 0; i < 14; i++) {
    const x = rrange(i, -W * .5, W * .5);
    ctx.strokeStyle = hexA(P.cream, .12);
    ctx.lineWidth = rrange(i + 4, 3, 12);
    ctx.beginPath();
    for (let y = -H; y <= H; y += 30)
      ctx.lineTo(x + Math.sin(y * .004 + i + t * .4) * 30, y);
    ctx.stroke();
    const ph = ((t * .5 + i / 14) % 1);
    glow(ctx, x, lerp(H * .8, -H * .8, ph), 40, P.gold, .5);
  }
  ctx.restore();

  const bs = lerp(1.0, 2.6, zoom);
  const fx = lerp(0, 40, zoom), fy = lerp(0, 90, zoom);
  ctx.translate(fx, fy);
  ctx.scale(bs, bs);
  ctx.translate(-fx / bs * 0, 0);

  paper(ctx, () => brainPath(ctx), hexA('#E4C3C9', .95), .45, 6, 10);
  paper(ctx, () => brainstemPath(ctx), hexA('#C99AA4', .95), .4, 5, 8);
  // cortical folding
  ctx.save();
  ctx.beginPath(); brainPath(ctx); ctx.clip();
  ctx.strokeStyle = hexA('#B07E8B', .5); ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    const yb = -170 + i * 34;
    for (let x = -220; x <= 220; x += 12)
      ctx.lineTo(x, yb + Math.sin(x * .022 + i * 1.4) * 22 + Math.sin(x * .008) * 14);
    ctx.stroke();
  }
  ctx.restore();

  // hypothalamus, then the arcuate nucleus within it
  const hx = -26, hy = 62;
  const hyp = smoothstep(4.0, 5.6, t);
  glow(ctx, hx, hy, 120, P.teal, .45 * hyp);
  blobPath(ctx, hx, hy, 46, .1, t * .4, 3, 6);
  ctx.fillStyle = hexA(P.teal, .30 * hyp); ctx.fill();
  ctx.strokeStyle = hexA(P.teal, .7 * hyp); ctx.lineWidth = 3; ctx.stroke();

  const arc = smoothstep(6.4, 8.4, t);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * TAU, rr = 15 + rnd(i) * 9;
    const x = hx - 6 + Math.cos(a) * rr, y = hy + 16 + Math.sin(a) * rr * .6;
    glow(ctx, x, y, 26, P.gold, .8 * arc * (.4 + .6 * pulse(t + i * .2, 1.3, 8)));
    ctx.fillStyle = hexA(P.gold, arc);
    ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fill();
  }
  // third ventricle, the midline the arcuate sits against
  ctx.strokeStyle = hexA(P.cream, .25 * hyp); ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(hx - 30, hy - 40); ctx.lineTo(hx - 30, hy + 46); ctx.stroke();

  // the vagal signal arriving from below
  ctx.strokeStyle = hexA(P.gold, .35);
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-62, 240); ctx.lineTo(hx - 4, hy + 34); ctx.stroke();
  ctx.restore();

  label(ctx, W * .16, H * .30, W * .5 - 30, H * .60, 'HYPOTHALAMUS', hyp * (1 - smoothstep(8.8, 9.8, t) * .4), P.teal);
  label(ctx, W * .84, H * .74, W * .5 + 30, H * .66, 'ARCUATE NUCLEUS', arc, P.gold);
  vignette(ctx, W, H, .74);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 9. POMC switched on, AgRP/NPY silenced ---------- */
function scene9(ctx, t, W, H) {
  bg(ctx, W, H, '#1B1038', '#080513');

  const wave = smoothstep(1.0, 3.2, t);      // drug reaching the circuit
  const pomcOn = smoothstep(2.0, 4.6, t);
  const agrpOff = smoothstep(5.0, 8.2, t);

  // incoming teal signal front
  if (wave > .01 && wave < .999) {
    const x = lerp(-200, W + 200, wave);
    glow(ctx, x, H * .5, 420, P.teal, .3);
  }

  // POMC cluster (left) — "enough"
  const pc = [[W * .27, H * .34], [W * .19, H * .55], [W * .32, H * .70], [W * .38, H * .47]];
  pc.forEach((p, i) => {
    const fire = pomcOn * (.5 + .5 * pulse(t + i * .27, 1.15, 8));
    neuron(ctx, p[0], p[1], 34, .1 + i * .5, pomcOn > .05 ? P.teal : '#4E6B72', fire, t, i * 4, 0);
  });
  // POMC axons projecting a calm, steady signal to the right
  if (pomcOn > .05) {
    const proj = [[W * .38, H * .47], [W * .5, H * .44], [W * .62, H * .48]];
    strokePath(ctx, () => curve(ctx, proj), hexA(P.teal, .45 * pomcOn), 6);
    pulsesAlong(ctx, proj, t, .45, 3, P.teal, 7, 0);
  }

  // AgRP / NPY cluster (right) — "find food now", thrashing then extinguished
  const ac = [[W * .72, H * .32], [W * .81, H * .52], [W * .69, H * .68], [W * .60, H * .58]];
  ac.forEach((p, i) => {
    const alive = 1 - agrpOff;
    const col = agrpOff > .55 ? P.grey : P.acid;
    const fire = alive * (.45 + .55 * pulse(t + i * .11, .42, 9));
    neuron(ctx, p[0], p[1], 32, Math.PI + i * .4, col, fire, t, i * 7 + 3, alive);
    // frantic firing bursts while still active
    for (let k = 0; k < 5; k++) {
      const ph = ((t * 1.6 + k / 5 + i * .3) % 1);
      ctx.fillStyle = hexA(P.acid, (1 - ph) * alive * .7);
      const a = rrange(i * 5 + k, 0, TAU);
      ctx.beginPath();
      ctx.arc(p[0] + Math.cos(a) * ph * 120, p[1] + Math.sin(a) * ph * 120, 5, 0, TAU);
      ctx.fill();
    }
  });

  // inhibition: teal tendrils reaching across and damping the yellow cluster
  if (agrpOff > .02) {
    ctx.save();
    ctx.globalAlpha = agrpOff;
    ac.forEach((p, i) => {
      ctx.strokeStyle = hexA(P.teal, .5); ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(W * .40, H * .48);
      ctx.quadraticCurveTo(W * .55, H * .40 + i * 40, p[0], p[1]);
      ctx.stroke();
      glow(ctx, p[0], p[1], 130, P.teal, .3);
    });
    ctx.restore();
  }

  label(ctx, W * .08, H * .16, W * .24, H * .40, 'POMC  —  SATIETY  ↑', pomcOn, P.teal);
  label(ctx, W * .93, H * .16, W * .76, H * .38, 'AgRP / NPY  —  HUNGER  ↓',
    smoothstep(4.6, 6.0, t), agrpOff > .55 ? P.grey : P.acid);

  vignette(ctx, W, H, .74);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 10. brainstem: NTS + area postrema, and early nausea ---------- */
function scene10(ctx, t, W, H) {
  bg(ctx, W, H, '#151033', '#060411');

  ctx.save();
  ctx.translate(W * .40, H * .48);
  ctx.scale(2.1, 2.1);
  ctx.globalAlpha = .5;
  paper(ctx, () => brainPath(ctx), hexA('#6E5A72', .55), .25, 5, 8);
  ctx.globalAlpha = 1;
  paper(ctx, () => brainstemPath(ctx), hexA('#D8AAB4', .95), .4, 5, 8);
  ctx.restore();

  // NTS and area postrema, in the dorsal medulla
  const nx = W * .40 - 150, ny = H * .48 + 300;
  const flare = smoothstep(1.2, 3.4, t);
  [[nx, ny, 'nts'], [nx + 6, ny + 92, 'ap']].forEach(([x, y], i) => {
    const f = flare * (.5 + .5 * pulse(t + i * .5, 1.7, 7));
    glow(ctx, x, y, 150, i ? P.gold : P.teal, .55 * f);
    blobPath(ctx, x, y, 34, .1, t * .5 + i, i + 2, 6);
    ctx.fillStyle = hexA(i ? P.gold : P.teal, .45 + .4 * f); ctx.fill();
    ctx.strokeStyle = hexA(P.cream, .45); ctx.lineWidth = 3; ctx.stroke();
  });

  // vagal input arriving from the gut, below
  const inFib = [[nx - 40, H + 60], [nx - 60, H * .82], [nx - 20, ny + 130]];
  strokePath(ctx, () => curve(ctx, inFib), hexA(P.gold, .4), 9);
  pulsesAlong(ctx, inFib, t, .35, 3, P.gold, 8, 0);

  // the nausea wave: a sickly green ripple that washes out and then settles
  const nauseaOn = smoothstep(4.6, 6.4, t);
  const nauseaOff = smoothstep(7.4, 9.6, t);
  const amp = nauseaOn * (1 - nauseaOff);
  if (amp > .01) {
    ctx.save();
    for (let r = 0; r < 5; r++) {
      const ph = ((t * .45 + r / 5) % 1);
      ctx.strokeStyle = hexA(P.sick, amp * (1 - ph) * .55);
      ctx.lineWidth = 14 * (1 - ph) + 3;
      ctx.beginPath();
      ctx.arc(nx, ny + 46, ph * 900, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = hexA(P.sick, amp * .10 * (.6 + .4 * Math.sin(t * 2.2)));
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  label(ctx, W * .80, H * .48, nx + 30, ny, 'NUCLEUS OF THE SOLITARY TRACT', smoothstep(2.0, 3.4, t), P.teal, 24);
  label(ctx, W * .84, H * .62, nx + 30, ny + 92, 'AREA POSTREMA', smoothstep(3.4, 4.6, t), P.gold, 24);
  label(ctx, W * .16, H * .18, W * .30, H * .34, 'EARLY NAUSEA  —  TRANSIENT', amp, P.sick, 24);

  vignette(ctx, W, H, .74);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 11. the GIP half: adipose handling + better tolerability ---------- */
function scene11(ctx, t, W, H) {
  bg(ctx, W, H, '#2A1430', '#0B0512');

  // left: adipose tissue reorganising under GIP-receptor signalling
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W * .52, H); ctx.clip();
  const shrink = smoothstep(1.4, 6.4, t);
  for (let i = 0; i < 15; i++) {
    const x = rrange(i, 60, W * .48), y = rrange(i + 40, H * .18, H * .86);
    const r = lerp(rrange(i + 80, 62, 96), rrange(i + 80, 62, 96) * .62, shrink);
    adipocyte(ctx, x, y, r, t, i, 1 - shrink * .55);
    // GIP receptors studding the fat-cell surface
    const a0 = rrange(i + 3, 0, TAU);
    for (let k = 0; k < 3; k++) {
      const a = a0 + k * 2.1;
      const lit = smoothstep(1.0, 2.6, t) * (.5 + .5 * pulse(t + i * .2 + k, 1.9, 7));
      glow(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 40, P.gold, .5 * lit);
      ctx.fillStyle = hexA(P.gold, .5 + .5 * lit);
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 8, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();

  // right: the green nausea ripple being damped by a second, teal wave
  ctx.save();
  ctx.beginPath(); ctx.rect(W * .52, 0, W * .48, H); ctx.clip();
  const cx = W * .76, cy = H * .5;
  const damp = smoothstep(3.6, 7.4, t);
  for (let r = 0; r < 5; r++) {
    const ph = ((t * .5 + r / 5) % 1);
    ctx.strokeStyle = hexA(P.sick, (1 - damp) * (1 - ph) * .6);
    ctx.lineWidth = 13 * (1 - ph) + 3;
    ctx.beginPath(); ctx.arc(cx, cy, ph * 520, 0, TAU); ctx.stroke();
  }
  for (let r = 0; r < 4; r++) {
    const ph = ((t * .38 + r / 4) % 1);
    ctx.strokeStyle = hexA(P.teal, damp * (1 - ph) * .7);
    ctx.lineWidth = 15 * (1 - ph) + 3;
    ctx.beginPath(); ctx.arc(cx, cy, (1 - ph) * 520, 0, TAU); ctx.stroke();
  }
  glow(ctx, cx, cy, 260, P.teal, damp * .35);
  ctx.restore();

  // dose dial: tolerability is what allows titration upward
  const dial = smoothstep(5.0, 9.0, t);
  const dcx = W * .76, dcy = H * .84, dr = 96;
  ctx.save();
  ctx.strokeStyle = hexA(P.cream, .35); ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(dcx, dcy, dr, Math.PI * .82, Math.PI * 2.18); ctx.stroke();
  ctx.strokeStyle = hexA(P.teal, .95); ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(dcx, dcy, dr, Math.PI * .82, Math.PI * .82 + (Math.PI * 1.36) * dial); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * .82 + (Math.PI * 1.36) * (i / 5);
    ctx.strokeStyle = hexA(P.cream, .5); ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dcx + Math.cos(a) * (dr + 12), dcy + Math.sin(a) * (dr + 12));
    ctx.lineTo(dcx + Math.cos(a) * (dr + 26), dcy + Math.sin(a) * (dr + 26));
    ctx.stroke();
  }
  ctx.fillStyle = P.cream;
  ctx.font = '600 30px "DejaVu Sans", Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = dial;
  ctx.fillText(`${(2.5 + 12.5 * dial).toFixed(1)} MG`, dcx, dcy + 6);
  ctx.restore();

  label(ctx, W * .04, H * .10, W * .22, H * .28, 'GIP RECEPTORS ON ADIPOCYTES', smoothstep(1.6, 3.0, t), P.gold, 24);
  label(ctx, W * .97, H * .16, cx, cy - 160, 'NAUSEA BLUNTED', smoothstep(4.4, 5.8, t), P.teal, 24);

  vignette(ctx, W, H, .74);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

/* ---------- 12. the outcome, and the reframe ---------- */
function scene12(ctx, t, W, H) {
  bg(ctx, W, H, '#3A1020', '#120510');
  motes(ctx, W, H, t, 50, P.teal, .16);

  const pull = easeInOut(clamp(t / 6.5, 0, 1));
  const narrow = smoothstep(1.5, 7.0, t) * .17;

  ctx.save();
  ctx.translate(W / 2, H / 2 + 30);
  const z = lerp(1.04, .84, pull);
  ctx.scale(z, z);

  glow(ctx, 0, 30, 330, P.teal, .18);
  paper(ctx, () => figurePath(ctx, narrow), hexA(P.cream, .15), .28, 8, 12);
  strokePath(ctx, () => figurePath(ctx, narrow), hexA(P.cream, .45), 3);

  // the gut-brain axis, now steady rather than clamouring
  const axis = [[0, 40], [-6, -110], [4, -240], [0, -368]];
  strokePath(ctx, () => curve(ctx, axis), hexA(P.teal, .55), 6);
  pulsesAlong(ctx, axis, t, .085, 2, P.teal, 7, .1);
  ctx.save();
  ctx.translate(0, -30);
  strokePath(ctx, () => intestinePath(ctx, t * .35), hexA(P.tealDeep, .55), 17);
  ctx.restore();
  glow(ctx, 0, -368, 120, P.teal, .3 + .2 * pulse(t, 3.2, 6));
  ctx.restore();

  // the trial result, drawn as an arc rather than stated as a number alone
  const show = smoothstep(3.0, 6.0, t);
  if (show > .01) {
    const cx = W * .82, cy = H * .5, r = 150;
    ctx.save();
    ctx.globalAlpha = show;
    ctx.strokeStyle = hexA(P.cream, .22); ctx.lineWidth = 18;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, TAU - Math.PI / 2); ctx.stroke();
    const frac = .209 * smoothstep(3.4, 7.6, t);
    ctx.strokeStyle = hexA(P.teal, .95); ctx.lineWidth = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * frac); ctx.stroke();
    glow(ctx, cx, cy, r * 1.5, P.teal, .18);
    ctx.fillStyle = P.cream;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 76px "DejaVu Sans", Arial, sans-serif';
    ctx.fillText(`${(frac * 100).toFixed(1)}%`, cx, cy - 10);
    ctx.font = '500 23px "DejaVu Sans", Arial, sans-serif';
    ctx.fillStyle = hexA(P.cream, .75);
    ctx.fillText('MEAN BODY WEIGHT', cx, cy + 44);
    ctx.fillText('72 WEEKS · 15 MG', cx, cy + 76);
    ctx.restore();
  }

  vignette(ctx, W, H, .8);
  grain(ctx, W, H, .1, document);
  seams(ctx, W, H, t, DUR);
}

const SCENES = [scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8, scene9, scene10, scene11, scene12];
